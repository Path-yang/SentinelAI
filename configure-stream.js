#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const mkdirp = require('mkdirp');
const os = require('os');

const app = express();
const PORT = 3001;

// Get server IP for proper URL generation across networks
function getServerIp() {
  const networkInterfaces = os.networkInterfaces();
  // Try to find a non-internal IPv4 address
  for (const name of Object.keys(networkInterfaces)) {
    for (const net of networkInterfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (!net.internal && net.family === 'IPv4') {
        return net.address;
      }
    }
  }
  // Fallback to localhost if no suitable interface is found
  return 'localhost';
}

const SERVER_IP = getServerIp();
console.log(`Server detected IP: ${SERVER_IP}`);

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
  // Disable caching for all HLS files to ensure fresh content
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
}, express.static(path.join(__dirname, 'hls'), {
  // Set headers for all files to improve streaming
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Connection', 'keep-alive');
  }
}));

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
    
    // spawn ffmpeg with extreme low-latency settings
    console.log(`Starting FFmpeg for ${streamName} with URL: ${rtspUrl} (auth: ${username ? 'yes' : 'no'})`);
    
    // Determine if we should use hardware acceleration
    let hwaccel = [];
    try {
      // Check for macOS (VideoToolbox)
      if (process.platform === 'darwin') {
        hwaccel = ['-hwaccel', 'videotoolbox'];
      }
      // Check for NVIDIA GPU (Linux/Windows)
      else if (fs.existsSync('/dev/nvidia0') || process.env.CUDA_VISIBLE_DEVICES) {
        hwaccel = ['-hwaccel', 'cuda'];
      }
    } catch (err) {
      console.log('Hardware acceleration not available, using software encoding');
    }
    
    const args = [
      // Global options
      '-hide_banner',
      '-loglevel', 'warning',
      
      // Input buffer options - extreme minimal buffering
      '-fflags', '+discardcorrupt+nobuffer+fastseek',
      '-flags', 'low_delay',
      '-avioflags', 'direct',
      
      // Hardware acceleration if available
      ...hwaccel,
      
      // RTSP specific options
      '-rtsp_transport', 'tcp',
      '-rtsp_flags', 'prefer_tcp+aggressive',
      '-stimeout', '2000000', // 2 second timeout (in microseconds)
      '-analyzeduration', '500000', // 0.5 seconds analysis (in microseconds)
      '-probesize', '32000', // Minimal probe size
      
      // Authentication if needed
      ...(username ? ['-user_agent', 'SentinelAI'] : []),
      ...(username && password ? [
        '-username', username,
        '-password', password
      ] : []),
      
      // Input source with minimal buffering
      '-i', rtspUrl,
      
      // Video codec settings - optimized for latency over quality
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-tune', 'zerolatency',
      '-profile:v', 'baseline',
      '-level', '3.0',
      '-x264opts', 'no-scenecut:vbv-maxrate=1000:vbv-bufsize=100:intra-refresh=1:slice-max-size=1500',
      
      // Reduce frame size for faster processing
      '-vf', 'scale=iw/1.5:ih/1.5',
      
      // GOP settings - extremely small GOP
      '-g', '10',
      '-keyint_min', '5',
      '-force_key_frames', 'expr:gte(t,n_forced*0.5)',
      
      // Bitrate control - lower quality for speed
      '-b:v', '500k',
      '-maxrate', '600k',
      '-bufsize', '300k',
      
      // Disable audio completely
      '-an',
      
      // Output format settings - extreme low latency HLS
      '-f', 'hls',
      '-hls_time', '0.2', // Ultra short segments (200ms)
      '-hls_list_size', '2', // Keep only 2 segments in playlist
      '-hls_flags', 'delete_segments+append_list+discont_start+omit_endlist+independent_segments',
      '-hls_segment_type', 'mpegts',
      '-hls_segment_filename', path.join(outDir, 'segment%03d.ts'),
      '-hls_init_time', '0.2',
      '-hls_allow_cache', '0',
      '-hls_playlist_type', 'event',
      
      // Add custom headers to m3u8 file
      '-hls_base_url', `http://${SERVER_IP}:${PORT}/hls/${streamName}/`,
      
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
    
    // Wait a moment to ensure FFmpeg has started generating segments
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // return HLS URL with server IP for cross-network access
    return res.json({ 
      success: true, 
      hlsUrl: `http://${SERVER_IP}:${PORT}/hls/${streamName}/index.m3u8`,
      serverIp: SERVER_IP
    });
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

// Server information endpoint
app.get('/api/server-info', (_req, res) => {
  res.json({ 
    ip: SERVER_IP,
    port: PORT,
    platform: process.platform,
    nodejs: process.version
  });
});

// health check
app.get('/api/status', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Stream configuration server listening on http://${SERVER_IP}:${PORT}`);
}); 