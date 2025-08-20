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
    backBufferLength: 90,
    maxBufferLength: 30,
    maxMaxBufferLength: 600,
    maxBufferSize: 60 * 1000 * 1000, // 60MB
    maxBufferHole: 0.5,
    highBufferWatchdogPeriod: 2,
    nudgeOffset: 0.2,
    nudgeMaxRetry: 5,
    maxFragLookUpTolerance: 0.25,
    liveSyncDurationCount: 3,
    liveMaxLatencyDurationCount: 10,
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