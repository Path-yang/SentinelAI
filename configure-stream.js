#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { spawn, exec } = require('child_process');
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
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control']
}));
app.use(express.json());

// Enhance HLS serving middleware with better headers
app.use('/hls', (req, res, next) => {
  // Disable caching for all HLS files to ensure fresh content
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control');
  
  // Add connection header
  res.setHeader('Connection', 'keep-alive');
  
  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
}, express.static(path.join(__dirname, 'hls')));

// Fix URL encoding for special characters in username/password
app.post('/api/test-connection', async (req, res) => {
  console.log('Received test-connection request:', req.body);
  try {
    const { rtspUrl, username, password, timeout = 5 } = req.body;
    if (!rtspUrl) {
      return res.status(400).json({ error: 'RTSP URL is required', success: false });
    }

    console.log(`Testing RTSP connection to: ${rtspUrl}`);
    
    // Build the RTSP URL with credentials if provided
    let fullRtspUrl = rtspUrl;
    if (username && password) {
      // Check if username already contains @ symbol (email address)
      const safeUsername = username.includes('@') ? 
        username.replace('@', '%40') : username;
      
      // Extract protocol and host/path
      const urlParts = rtspUrl.match(/^(rtsp:\/\/)(.+)$/);
      if (urlParts && urlParts.length === 3) {
        // Use username and password directly without URL encoding
        // This works better with special characters in many RTSP implementations
        fullRtspUrl = `${urlParts[1]}${safeUsername}:${password}@${urlParts[2]}`;
        console.log(`Using credentials in URL: ${fullRtspUrl}`);
      }
    }
    
    // Prepare FFmpeg command for connection test - use minimal arguments
    // FFmpeg args for connection test using fullRtspUrl
    const args = ['-loglevel', 'warning', '-rtsp_transport', 'tcp', '-i', fullRtspUrl, '-t', '1', '-f', 'null', '-'];

    console.log(`FFmpeg test command: ffmpeg ${args.join(' ')}`);
    
    // Use a promise with timeout to limit test duration
    const testPromise = new Promise((resolve, reject) => {
      const ffmpegProcess = spawn('ffmpeg', args, { stdio: ['ignore', 'ignore', 'pipe'] });
      let errorOutput = '';
      
      ffmpegProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      ffmpegProcess.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true });
        } else {
          console.error(`FFmpeg test failed with code ${code}: ${errorOutput}`);
          reject(new Error(`Cannot connect to camera: ${errorOutput}`));
        }
      });
      
      // Kill the process after timeout + 1 second
      setTimeout(() => {
        ffmpegProcess.kill('SIGKILL');
        reject(new Error('Connection test timed out'));
      }, (timeout + 1) * 1000);
    });
    
    // Run the test with a timeout
    try {
      await testPromise;
      return res.json({ success: true });
    } catch (error) {
      return res.status(400).json({ 
        error: error.message || 'Failed to connect to camera', 
        success: false 
      });
    }
  } catch (err) {
    console.error('Error testing connection:', err);
    return res.status(500).json({ 
      error: 'Internal server error', 
      success: false 
    });
  }
});

// Simplify FFmpeg arguments for better compatibility
app.post('/api/configure-stream', async (req, res) => {
  try {
    const { streamName, rtspUrl, username, password } = req.body;
    
    if (!streamName || !rtspUrl) {
      return res.status(400).json({ error: 'Stream name and RTSP URL are required' });
    }
    
    console.log(`Configuring stream ${streamName} with URL: ${rtspUrl} (auth: ${username ? 'yes' : 'no'})`);
    
    // Create output directory
    const outDir = path.join(__dirname, 'hls', streamName);
    await mkdirp(outDir);
    
    // Kill any existing FFmpeg process for this stream
    if (ffmpegProcs[streamName]) {
      console.log(`Killing existing FFmpeg process for ${streamName}`);
      ffmpegProcs[streamName].kill('SIGKILL');
      delete ffmpegProcs[streamName];
    }
    
    // Prepare RTSP URL with credentials if provided
    let fullRtspUrl = rtspUrl;
    if (username && password) {
      // Check if username already contains @ symbol (email address)
      const safeUsername = username.includes('@') ? 
        username.replace('@', '%40') : username;
        
      const urlParts = rtspUrl.match(/^(rtsp:\/\/)(.+)$/);
      if (urlParts && urlParts.length === 3) {
        fullRtspUrl = `${urlParts[1]}${safeUsername}:${password}@${urlParts[2]}`;
        console.log(`Using credentials in URL: ${fullRtspUrl}`);
      }
    }

    // Use simpler FFmpeg args with direct copy
    const args = [
      // Input options
      '-rtsp_transport', 'tcp',
      '-i', fullRtspUrl,
      
      // Output options - direct copy without re-encoding
      '-c', 'copy',
      '-f', 'hls',
      '-hls_time', '2',
      '-hls_list_size', '3',
      '-hls_flags', 'delete_segments',
      '-hls_segment_filename', path.join(outDir, 'segment%03d.ts'),
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
    await new Promise(resolve => setTimeout(resolve, 2000));
    
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
app.get('/api/server-info', (req, res) => {
  console.log('Received server-info request');
  res.json({ ip: SERVER_IP });
});

// health check
app.get('/api/status', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Stream configuration server running on port ${PORT}`);
  console.log(`Server IP: ${SERVER_IP}`);
  console.log(`Available endpoints:`);
  console.log(`- POST /api/configure-stream`);
  console.log(`- DELETE /api/remove-stream`);
  console.log(`- POST /api/test-connection`);
  console.log(`- GET /api/server-info`);
}); 