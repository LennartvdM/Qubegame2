import React, { useRef, useEffect } from 'react';

const TAP_MAX_DISTANCE = 10; // px
const TAP_MAX_TIME = 250; // ms
const SWIPE_MIN_DISTANCE = 30; // px

const Logo = ({ onDownGesture, onUpGesture, isRunning, isGameOver }) => {
  const logoRef = useRef(null);
  const touchStartRef = useRef(null);

  useEffect(() => {
    const el = logoRef.current;
    if (!el) return;

    el.style.transition = 'transform 0.2s ease-out';
    el.style.transform = 'translateY(0)';
  }, []);

  const handlePointerDown = (e) => {
    if (isGameOver) return;
    if (e.pointerType && e.pointerType === 'mouse') return;

    touchStartRef.current = {
      y: e.clientY,
      time: performance.now(),
      pointerId: e.pointerId,
    };

    if (e.currentTarget.setPointerCapture) {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerUp = (e) => {
    const start = touchStartRef.current;
    if (!start || start.pointerId !== e.pointerId) return;
    touchStartRef.current = null;

    if (!isRunning || isGameOver) return;

    const dy = e.clientY - start.y;
    const dt = performance.now() - start.time;
    const absDy = Math.abs(dy);

    if (absDy < TAP_MAX_DISTANCE && dt < TAP_MAX_TIME) {
      onDownGesture?.();
      return;
    }

    if (dy > SWIPE_MIN_DISTANCE) {
      onDownGesture?.();
      return;
    }

    if (dy < -SWIPE_MIN_DISTANCE) {
      onUpGesture?.();
    }
  };

  return (
    <div
      ref={logoRef}
      className="text-center mb-4"
      style={{ transform: 'translateY(-20px)', touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <h1 className="text-4xl font-bold text-gray-800">Qube Game</h1>
    </div>
  );
};

export default Logo;
