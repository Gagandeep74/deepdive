import React, { useRef, useEffect, useState } from 'react';

// Hook to detect light mode
const useIsLightMode = () => {
  const [isLight, setIsLight] = useState(false);
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLight(document.documentElement.classList.contains('light-theme'));
    });
    setIsLight(document.documentElement.classList.contains('light-theme'));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return isLight;
};

export default function Starfield() {
  const canvasRef = useRef(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const isLightMode = useIsLightMode();

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);
    const motionHandler = (e) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener('change', motionHandler);

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      motionQuery.removeEventListener('change', motionHandler);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let stars = [];
    let w, h;
    let scrollY = 0;

    const resize = () => {
      // Use devicePixelRatio for crisp rendering
      const dpr = window.devicePixelRatio || 1;
      w = window.innerWidth;
      // We want the canvas to span the document height ideally, or just fixed viewport height.
      // A fixed viewport background is much more performant.
      h = window.innerHeight;
      
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      
      initStars();
    };

    const initStars = () => {
      stars = [];
      const numStars = isMobile ? (isLightMode ? 30 : 50) : (isLightMode ? 70 : 120);
      for (let i = 0; i < numStars; i++) {
        if (isLightMode) {
          // Dust motes for sun effect
          stars.push({
            x: Math.random() * w,
            y: Math.random() * h,
            size: Math.random() * 3 + 1, // larger
            baseOpacity: Math.random() * 0.3 + 0.05, // softer
            twinkleSpeed: Math.random() * 0.01 + 0.002, // slower
            twinklePhase: Math.random() * Math.PI * 2,
            isParallax: true,
            parallaxFactor: Math.random() * 0.3 + 0.1, // slower parallax
            driftX: (Math.random() - 0.5) * 0.2,
            driftY: (Math.random() - 0.2) * 0.3, // mostly drift down/float
            color: Math.random() > 0.5 ? '#fcd34d' : '#ffffff' // Amber-ish or white
          });
        } else {
          // Normal stars
          stars.push({
            x: Math.random() * w,
            y: Math.random() * h,
            size: Math.random() * 1.5 + 0.5,
            baseOpacity: Math.random() * 0.5 + 0.1, // 0.1 to 0.6
            twinkleSpeed: Math.random() * 0.02 + 0.005,
            twinklePhase: Math.random() * Math.PI * 2,
            isParallax: Math.random() > 0.9, // 10% are parallax
            parallaxFactor: Math.random() * 0.5 + 0.2, // speed multiplier
            driftX: 0,
            driftY: -0.2, // strict upward drift
            color: Math.random() > 0.8 ? '#a78bfa' : '#ffffff' // Occasionally violet
          });
        }
      }
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, w, h);

      // Draw Sun Effect in Light Mode
      if (isLightMode) {
        const sunX = w * 0.8;
        const sunY = h * 0.2;
        const sunRadius = Math.max(w, h) * 0.6;
        
        const gradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius);
        gradient.addColorStop(0, 'rgba(251, 191, 36, 0.15)'); // Amber center
        gradient.addColorStop(0.3, 'rgba(251, 191, 36, 0.05)');
        gradient.addColorStop(1, 'rgba(251, 191, 36, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      }

      const isHidden = document.hidden;
      // Animate even on mobile, just with fewer stars (already handled in initStars)
      const shouldAnimate = !isHidden && !prefersReducedMotion;

      stars.forEach((star) => {
        // Calculate dynamic opacity
        let currentOpacity = star.baseOpacity;
        if (shouldAnimate) {
          star.twinklePhase += star.twinkleSpeed;
          // Oscillate opacity between base and base + amplitude
          currentOpacity = star.baseOpacity + Math.sin(star.twinklePhase) * (isLightMode ? 0.2 : 0.3);
          // Clamp opacity
          currentOpacity = Math.max(0.02, Math.min(1, currentOpacity));
        } else if (prefersReducedMotion) {
          // Static opacity if reduced motion
          currentOpacity = star.baseOpacity + (isLightMode ? 0.1 : 0.2);
        }

        // Calculate position (add continuous slow drift + scroll parallax)
        let yPos = star.y;
        if (shouldAnimate) {
          star.x = star.x + star.driftX;
          star.y = star.y + star.driftY * (isLightMode ? 1 : star.parallaxFactor);
          
          if (star.y < 0) star.y += h;
          if (star.y > h) star.y -= h;
          if (star.x < 0) star.x += w;
          if (star.x > w) star.x -= w;
          yPos = star.y;
        }

        if (star.isParallax && !prefersReducedMotion) {
          // Additional parallax depth on scroll
          yPos = (yPos - scrollY * star.parallaxFactor) % h;
          if (yPos < 0) yPos += h;
        }

        ctx.beginPath();
        ctx.arc(star.x, yPos, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        
        if (isLightMode) {
          // Soft glow for dust motes
          ctx.shadowBlur = 8;
          ctx.shadowColor = star.color;
        } else {
          ctx.shadowBlur = 0;
        }
        
        ctx.globalAlpha = currentOpacity;
        ctx.fill();
      });

      // Always reset alpha and shadow
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // Only request next frame if we are allowed to animate
      // If we shouldn't animate, we just draw once and stop the loop,
      // but wait, if scroll changes, we might need to redraw for parallax even if reduced motion is true?
      // Actually reduced motion disables parallax above.
      // So if not animating, we don't need a loop, EXCEPT we need to handle resize.
      // We will just keep the loop running but it will be very cheap if no logic is done?
      // Better: let's just let it run. requestAnimationFrame pauses automatically when tab is inactive.
      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, [prefersReducedMotion, isMobile, isLightMode]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: -1,
      }}
    />
  );
}
