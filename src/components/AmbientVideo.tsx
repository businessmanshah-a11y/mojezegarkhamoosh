import React, { useRef, useEffect } from 'react';

interface AmbientVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  poster?: string;
  className?: string;
}

export const AmbientVideo: React.FC<AmbientVideoProps> = ({
  src,
  poster,
  className = '',
  ...props
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Explicit function to safely trigger play
    const safePlay = () => {
      if (video.paused) {
        const promise = video.play();
        if (promise !== undefined) {
          promise.catch(() => {
            // Auto-play was prevented or interrupted, retry on interaction if needed
          });
        }
      }
    };

    // Endless seamless looping fallback:
    // If native loop stalls or stops at end of stream, rewind and play immediately
    const handleEnded = () => {
      video.currentTime = 0;
      safePlay();
    };

    // If browser auto-pauses when stalled, re-play
    const handleStalled = () => {
      safePlay();
    };

    video.addEventListener('ended', handleEnded);
    video.addEventListener('stalled', handleStalled);

    // IntersectionObserver:
    // 1. Play when in viewport
    // 2. Pause when scrolled far out of view to free GPU decode resources and eliminate scroll lag!
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            safePlay();
          } else {
            // Pause off-screen video to prevent concurrent GPU overload
            video.pause();
          }
        });
      },
      { threshold: 0.05, rootMargin: '100px 0px 100px 0px' }
    );

    observer.observe(video);
    safePlay();

    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('stalled', handleStalled);
      observer.disconnect();
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      className={`transform-gpu ${className}`}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      onEnded={(e) => {
        e.currentTarget.currentTime = 0;
        e.currentTarget.play().catch(() => {});
      }}
      {...props}
    />
  );
};
