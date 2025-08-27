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
app.use(cors());
app.use(express.json());

// Serve HLS output
app.use('/hls', express.static(path.join(__dirname, 'hls')));

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
    // spawn ffmpeg
    console.log(`Starting FFmpeg for ${streamName} with URL: ${rtspUrl} (auth: ${username ? 'yes' : 'no'})`);
    const args = [
      '-rtsp_transport', 'tcp',
      ...(username ? ['-user_agent', 'SentinelAI'] : []),
      ...(username && password ? ['-rtsp_transport', 'tcp'] : []),
      ...(username && password ? [
        '-username', username,
        '-password', password
      ] : []),
      '-i', rtspUrl,
      '-c:v', 'copy',
      '-c:a', 'copy',
      '-f', 'hls',
      '-hls_time', '2',
      '-hls_list_size', '3',
      '-hls_flags', 'delete_segments+append_list',
      path.join(outDir, 'index.m3u8')
    ];
    console.log(`FFmpeg args: ${args.join(' ')}`);
    const ff = spawn('ffmpeg', args, { stdio: ['ignore','ignore','ignore'] });
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

// POST /api/remove-stream
// body: { streamName }
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