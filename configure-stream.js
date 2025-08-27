#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Path to MediaMTX config file
const CONFIG_FILE = path.join(__dirname, 'mediamtx.yml');

// Function to read the current config
function readConfig() {
  try {
    const fileContents = fs.readFileSync(CONFIG_FILE, 'utf8');
    return yaml.load(fileContents);
  } catch (e) {
    console.error('Error reading config file:', e);
    return { paths: {} };
  }
}

// Function to write the updated config
function writeConfig(config) {
  try {
    const yamlStr = yaml.dump(config);
    fs.writeFileSync(CONFIG_FILE, yamlStr, 'utf8');
    return true;
  } catch (e) {
    console.error('Error writing config file:', e);
    return false;
  }
}

// API endpoint to configure a stream
app.post('/api/configure-stream', async (req, res) => {
  try {
    const { streamName, rtspUrl } = req.body;
    
    if (!streamName || !rtspUrl) {
      return res.status(400).json({ error: 'Stream name and RTSP URL are required' });
    }
    
    // Validate stream name (alphanumeric and underscore only)
    if (!/^[a-zA-Z0-9_]+$/.test(streamName)) {
      return res.status(400).json({ error: 'Stream name can only contain letters, numbers, and underscores' });
    }
    
    // Validate RTSP URL
    if (!rtspUrl.toLowerCase().startsWith('rtsp://')) {
      return res.status(400).json({ error: 'URL must start with rtsp://' });
    }
    
    // Read current config
    const config = readConfig();
    
    // Add or update the stream configuration
    if (!config.paths) {
      config.paths = {};
    }
    
    config.paths[streamName] = {
      source: rtspUrl,
      sourceOnDemand: 'yes',
      sourceProtocol: 'tcp'
    };
    
    // Write updated config
    if (!writeConfig(config)) {
      return res.status(500).json({ error: 'Failed to update configuration' });
    }
    
    // Return success with HLS URL
    res.json({
      success: true,
      hlsUrl: `http://localhost:8084/${streamName}/index.m3u8`
    });
  } catch (error) {
    console.error('Error configuring stream:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint to remove a stream
app.post('/api/remove-stream', async (req, res) => {
  try {
    const { streamName } = req.body;
    
    if (!streamName) {
      return res.status(400).json({ error: 'Stream name is required' });
    }
    
    // Read current config
    const config = readConfig();
    
    // Remove the stream if it exists
    if (config.paths && config.paths[streamName]) {
      delete config.paths[streamName];
      
      // Write updated config
      if (!writeConfig(config)) {
        return res.status(500).json({ error: 'Failed to update configuration' });
      }
    }
    
    // Return success
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing stream:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint to check status
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Stream configuration server running on http://localhost:${PORT}`);
}); 