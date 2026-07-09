import React, { useRef, useEffect, useState } from 'react';

export default function Starfield() {
  const canvasRef = useRef(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
      const numStars = isMobile ? 50 : 120;
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 1.5 + 0.5,
          baseOpacity: Math.random() * 0.5 + 0.1, // 0.1 to 0.6
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2,
          isParallax: Math.random() > 0.9, // 10% are parallax
          parallaxFactor: Math.random() * 0.5 + 0.2, // speed multiplier
          color: Math.random() > 0.8 ? '#a78bfa' : '#ffffff' // Occasionally violet
        });
      }
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, w, h);

      const isHidden = document.hidden;
      const shouldAnimate = !isHidden && !prefersReducedMotion && !isMobile;

      stars.forEach((star) => {
        // Calculate dynamic opacity
        let currentOpacity = star.baseOpacity;
        if (shouldAnimate) {
          star.twinklePhase += star.twinkleSpeed;
          // Oscillate opacity between base and base + 0.4
          currentOpacity = star.baseOpacity + Math.sin(star.twinklePhase) * 0.3;
          // Clamp opacity
          currentOpacity = Math.max(0.05, Math.min(1, currentOpacity));
        } else if (prefersReducedMotion) {
          // Static opacity if reduced motion
          currentOpacity = star.baseOpacity + 0.2;
        }

        // Calculate position
        let yPos = star.y;
        if (star.isParallax && !prefersReducedMotion) {
          // Move opposite to scroll to simulate depth (background moving slower than foreground)
          yPos = (star.y - scrollY * star.parallaxFactor) % h;
          if (yPos < 0) yPos += h;
        }

        ctx.beginPath();
        ctx.arc(star.x, yPos, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = currentOpacity;
        ctx.fill();
      });

      // Always reset alpha
      ctx.globalAlpha = 1;

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
  }, [prefersReducedMotion, isMobile]);

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
