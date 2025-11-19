import React, { useRef, useEffect } from 'react';

const Logo = () => {
  const logoRef = useRef(null);

  useEffect(() => {
    const el = logoRef.current;
    if (!el) return;

    el.style.transition = 'transform 0.2s ease-out';
    el.style.transform = 'translateY(0)';
  }, []);

  return (
    <div
      ref={logoRef}
      className="text-center mb-4"
      style={{ transform: 'translateY(-20px)' }}
    >
      <h1 className="text-4xl font-bold text-gray-800">Qube Game</h1>
    </div>
  );
};

export default Logo;
