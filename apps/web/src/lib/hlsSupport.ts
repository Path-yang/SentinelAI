import Hls from 'hls.js';

export const canUseNativeHls = (video: HTMLVideoElement): boolean => {
  return video.canPlayType('application/vnd.apple.mpegurl') !== '';
};

export const initHlsInstance = (
  src: string,
  video: HTMLVideoElement,
  onError: (error: string) => void,
  onReady: () => void
): Hls | null => {
  if (!Hls.isSupported()) {
    onError('HLS is not supported by your browser');
    return null;
  }

  const hls = new Hls({
    enableWorker: true,
    lowLatencyMode: true,
    // Ultra-aggressive low-latency settings for sub-second delay
    backBufferLength: 5, // Minimal back buffer
    maxBufferLength: 2, // Very small buffer
    maxMaxBufferLength: 5, // Minimal max buffer
    maxBufferSize: 2 * 1000 * 1000, // Only 2MB buffer
    maxBufferHole: 0.05, // Very small buffer hole tolerance
    highBufferWatchdogPeriod: 0.5, // Aggressive watchdog
    nudgeOffset: 0.05, // Minimal nudge offset
    nudgeMaxRetry: 2, // Fewer retries
    maxFragLookUpTolerance: 0.05, // Minimal tolerance
    liveSyncDurationCount: 0.5, // Half segment sync
    liveMaxLatencyDurationCount: 1, // Minimal latency
    // Additional ultra-low latency optimizations
    liveDurationInfinity: true,
    progressive: true,
    // Minimal loading delays
    maxLoadingDelay: 0.5,
    maxBufferStarvationDelay: 0.5,
    // Disable features that add latency
    enableSoftwareAES: false,
    enableDateRangeMetadataCues: false,
    enableEmsgMetadataCues: false,
    enableID3MetadataCues: false,
    enableWebVTT: false,
    enableIMSC1: false,
    enableCEA708Captions: false,
    // Aggressive ABR for low latency
    abrEwmaFastLive: 1,
    abrEwmaSlowLive: 1,
    abrEwmaFastVoD: 1,
    abrEwmaSlowVoD: 1,
    abrBandWidthFactor: 0.95,
    abrBandWidthUpFactor: 0.7,
    abrMaxWithRealBitrate: true,
  });

  hls.loadSource(src);
  hls.attachMedia(video);

  hls.on(Hls.Events.MANIFEST_PARSED, () => {
    onReady();
    video.play().catch(err => {
      console.warn('Auto-play was prevented:', err);
    });
  });

  hls.on(Hls.Events.ERROR, (_, data) => {
    if (data.fatal) {
      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          onError('Network error, trying to recover...');
          hls.startLoad();
          break;
        case Hls.ErrorTypes.MEDIA_ERROR:
          onError('Media error, trying to recover...');
          hls.recoverMediaError();
          break;
        default:
          onError('Fatal error: unable to load video');
          hls.destroy();
          break;
      }
    }
  });

  return hls;
};

export const retryWithDelay = (
  fn: () => void,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<void> => {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const attempt = () => {
      attempts++;
      try {
        fn();
        resolve();
      } catch (error) {
        if (attempts >= maxRetries) {
          reject(error);
        } else {
          setTimeout(attempt, delay * attempts);
        }
      }
    };

    attempt();
  });
}; 