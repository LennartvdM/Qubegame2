import React, { useState, useRef, useEffect } from 'react';
import Package from './Package';
import Scoreboard from './Scoreboard';
import ControlButtons from './ControlButtons';
import Logo from './Logo';

const GAME_HEIGHT = 600;
const START_SPEED = 2;
const SPEED_INCREMENT = 0.1;

const PreciseCollisionGame = () => {
  const [position, setPosition] = useState(GAME_HEIGHT / 2);
  const [speed, setSpeed] = useState(START_SPEED);
  const [direction, setDirection] = useState(1);
  const [score, setScore] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const requestRef = useRef(null);
  const lastTimeRef = useRef(null);
  const packageRef = useRef(null);
  const burstModeRef = useRef(null);

  const resetGame = () => {
    setPosition(GAME_HEIGHT / 2);
    setSpeed(START_SPEED);
    setDirection(1);
    setScore(0);
    setIsGameOver(false);
    lastTimeRef.current = null;
  };

  const toggleGame = () => {
    if (isRunning) {
      setIsRunning(false);
      cancelAnimationFrame(requestRef.current);
    } else {
      if (isGameOver) resetGame();
      setIsRunning(true);
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  const animate = (timestamp) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
      requestRef.current = requestAnimationFrame(animate);
      return;
    }

    const delta = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    let newPosition = position + direction * speed * (delta / 16);

    if (newPosition <= 0 || newPosition >= GAME_HEIGHT) {
      setDirection((prev) => -prev);
      newPosition = Math.max(0, Math.min(GAME_HEIGHT, newPosition));
    }

    setPosition(newPosition);

    if (isRunning) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  const handleStop = () => {
    if (!isRunning || isGameOver) return;

    setIsRunning(false);
    cancelAnimationFrame(requestRef.current);

    const packageEl = packageRef.current;
    const packageRect = packageEl.getBoundingClientRect();
    const packageCenter = packageRect.top + packageRect.height / 2;

    const conveyorY = window.innerHeight / 2;
    const distance = Math.abs(packageCenter - conveyorY);

    if (distance < 20) {
      setScore((prev) => prev + 1);
      setSpeed((prev) => prev + SPEED_INCREMENT);
      setTimeout(() => toggleGame(), 300);
    } else {
      setIsGameOver(true);
    }
  };

  const triggerBurst = () => {
    if (burstModeRef.current) {
      burstModeRef.current.remainingBursts = 3;
      burstModeRef.current.lastBurstTime = 0;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!burstModeRef.current) return;
      const burst = burstModeRef.current;
      const now = Date.now();

      if (burst.remainingBursts > 0 && now - burst.lastBurstTime > 100) {
        setSpeed((s) => s + 1);
        burst.remainingBursts -= 1;
        burst.lastBurstTime = now;
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-between h-screen p-4 bg-gray-100">
      <div className="w-full max-w-lg">
        <Logo />
      </div>

      <div className="relative w-full max-w-lg h-96 border-4 border-gray-300 rounded-xl bg-white overflow-hidden">
        <div
          ref={packageRef}
          className="absolute left-1/2 transform -translate-x-1/2"
          style={{ top: `${(position / GAME_HEIGHT) * 100}%` }}
        >
          <Package />
        </div>

        <div className="absolute top-1/2 left-0 w-full h-1 bg-blue-400" />
      </div>

      <Scoreboard score={score} isGameOver={isGameOver} />

      <ControlButtons
        isRunning={isRunning}
        toggleGame={toggleGame}
        handleStop={handleStop}
        triggerBurst={triggerBurst}
      />

      <div ref={burstModeRef} className="hidden" />
    </div>
  );
};

export default PreciseCollisionGame;

