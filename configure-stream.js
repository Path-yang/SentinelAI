#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const mkdirp = require('mkdirp');

const app = express();
const PORT = 3001;

// In-memory map of FFmpeg processes by streamName
const ffmpegProcs = {};

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Serve HLS output with aggressive caching disabled
app.use('/hls', (req, res, next) => {
  // Disable caching for m3u8 playlist files to ensure fresh content
  if (req.path.endsWith('.m3u8')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
}, express.static(path.join(__dirname, 'hls')));

// POST /api/configure-stream
// body: { streamName, rtspUrl }
app.post('/api/configure-stream', async (req, res) => {
  try {
    const { streamName, rtspUrl, username, password } = req.body;
    if (!streamName || !rtspUrl) {
      return res.status(400).json({ error: 'Stream name and RTSP URL are required' });
    }
    // sanitize streamName
    if (!/^[a-zA-Z0-9_\-]+$/.test(streamName)) {
      return res.status(400).json({ error: 'Invalid stream name' });
    }
    // kill old process if exists
    if (ffmpegProcs[streamName]) {
      ffmpegProcs[streamName].kill('SIGKILL');
      delete ffmpegProcs[streamName];
    }
    // prepare output directory
    const outDir = path.join(__dirname, 'hls', streamName);
    await mkdirp(outDir);
    
    // spawn ffmpeg with ultra-low latency settings
    console.log(`Starting FFmpeg for ${streamName} with URL: ${rtspUrl} (auth: ${username ? 'yes' : 'no'})`);
    const args = [
      // Input options
      '-fflags', 'nobuffer', // Reduce input buffering
      '-flags', 'low_delay',  // Enable low delay flags
      '-rtsp_transport', 'tcp', // Use TCP for more reliable streaming
      '-rtsp_flags', 'prefer_tcp', // Prefer TCP for RTSP
      '-analyzeduration', '1000000', // Reduce analyze time (in microseconds)
      '-probesize', '32000', // Reduce probe size
      
      // Authentication if needed
      ...(username ? ['-user_agent', 'SentinelAI'] : []),
      ...(username && password ? [
        '-username', username,
        '-password', password
      ] : []),
      
      // Input source
      '-i', rtspUrl,
      
      // Video codec settings
      '-c:v', 'libx264', // Use H.264 for compatibility
      '-preset', 'ultrafast', // Fastest encoding
      '-tune', 'zerolatency', // Optimize for zero latency
      '-profile:v', 'baseline', // Use baseline profile for lower latency
      '-level', '3.0',
      '-x264opts', 'no-scenecut', // Disable scene cut detection
      
      // GOP settings
      '-g', '15', // Set keyframe interval to 15 frames
      '-keyint_min', '15', // Minimum keyframe interval
      '-force_key_frames', 'expr:gte(t,n_forced*1)', // Force keyframe every 1 second
      
      // Bitrate control
      '-b:v', '800k', // Lower bitrate for faster transmission
      '-bufsize', '800k', // Match buffer size to bitrate
      '-maxrate', '1000k', // Maximum bitrate
      
      // Audio settings (minimal or disabled for lowest latency)
      '-an', // Disable audio for lowest latency
      
      // HLS specific settings
      '-f', 'hls',
      '-hls_time', '0.5', // Very short segments (0.5 seconds)
      '-hls_list_size', '2', // Keep only 2 segments in playlist
      '-hls_flags', 'delete_segments+append_list+discont_start+omit_endlist',
      '-hls_segment_type', 'mpegts', // Use mpegts segments for lower latency
      '-hls_segment_filename', path.join(outDir, 'segment%03d.ts'),
      '-hls_init_time', '0.5', // Initial segment duration
      '-hls_allow_cache', '0', // Disable client-side caching
      
      // Output
      path.join(outDir, 'index.m3u8')
    ];
    
    console.log(`FFmpeg args: ${args.join(' ')}`);
    const ff = spawn('ffmpeg', args, { stdio: 'pipe' });
    
    // Capture and log stderr for debugging
    ff.stderr.on('data', (data) => {
      console.log(`FFmpeg ${streamName} stderr: ${data}`);
    });
    
    ffmpegProcs[streamName] = ff;
    ff.on('exit', (code, signal) => {
      console.log(`FFmpeg ${streamName} exited code=${code} sig=${signal}`);
      delete ffmpegProcs[streamName];
    });
    
    // return HLS URL
    return res.json({ success: true, hlsUrl: `http://localhost:${PORT}/hls/${streamName}/index.m3u8` });
  } catch (err) {
    console.error('Error configuring stream:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/remove-stream?streamName=xxx
app.delete('/api/remove-stream', (req, res) => {
  try {
    const { streamName } = req.query;
    if (!streamName) {
      return res.status(400).json({ error: 'Stream name is required' });
    }
    if (ffmpegProcs[streamName]) {
      ffmpegProcs[streamName].kill('SIGKILL');
      delete ffmpegProcs[streamName];
    }
    const outDir = path.join(__dirname, 'hls', streamName);
    if (fs.existsSync(outDir)) {
      fs.rmdirSync(outDir, { recursive: true });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('Error removing stream:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Keep the POST endpoint for backward compatibility
app.post('/api/remove-stream', (req, res) => {
  try {
    const { streamName } = req.body;
    if (!streamName) {
      return res.status(400).json({ error: 'Stream name is required' });
    }
    if (ffmpegProcs[streamName]) {
      ffmpegProcs[streamName].kill('SIGKILL');
      delete ffmpegProcs[streamName];
    }
    const outDir = path.join(__dirname, 'hls', streamName);
    if (fs.existsSync(outDir)) {
      fs.rmdirSync(outDir, { recursive: true });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('Error removing stream:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// health check
app.get('/api/status', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Stream configuration server listening on http://localhost:${PORT}`);
}); 