import { useEffect, useRef } from 'react';

export const useMouseTilt = (options = { max: 15, perspective: 1200, scale: 1.02 }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let timeout;
    
    const handleMouseMove = (e) => {
      if (timeout) cancelAnimationFrame(timeout);
      
      timeout = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate rotation (inverted so it tilts towards the mouse)
        const rotateX = ((y - centerY) / centerY) * -options.max;
        const rotateY = ((x - centerX) / centerX) * options.max;
        
        el.style.transform = `perspective(${options.perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${options.scale})`;
      });
    };

    const handleMouseLeave = () => {
      if (timeout) cancelAnimationFrame(timeout);
      el.style.transform = `perspective(${options.perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`;
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);
    
    // Manage transition speed (fast when tracking, slow when resetting)
    el.addEventListener('mouseenter', () => {
      el.style.transition = 'transform 0.1s ease-out';
    });
    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform 0.5s ease-out';
    });

    // Initial state
    el.style.transition = 'transform 0.5s ease-out';

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [options.max, options.perspective, options.scale]);

  return ref;
};
