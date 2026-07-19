import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

export const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
        toast.success('Fullscreen mode ON');
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
        toast.success('Fullscreen mode OFF');
      }
    } catch (err) {
      toast.error('Fullscreen not supported');
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return { isFullscreen, toggleFullscreen, containerRef };
};