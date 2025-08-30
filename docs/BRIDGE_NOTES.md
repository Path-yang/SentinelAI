## Dev quickstart
- Run MediaMTX with HLS:
  mediamtx.yml:
  ---
  hlsEnable: yes
  hlsDirectory: /hls
  paths:
    ~^cam-:
      source: publisher
  ---

- Example Bridge publish (copy codec if possible):
  ffmpeg -nostdin -rtsp_transport tcp -i "rtsp://user:pass@192.168.1.20:554/Streaming/Channels/101" \
    -c:v copy -c:a aac -f rtsp rtsp://stream.yourdomain.com:8554/cam-12345

- Frontend plays:
  https://stream.yourdomain.com/hls/cam-12345/index.m3u8

- Security: HTTPS/WSS, CORS for .m3u8/.ts, per-camera JWT/token for RTSP publish. 