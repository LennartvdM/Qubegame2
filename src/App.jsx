import { useCallback, useEffect, useRef, useState } from 'react';
import GameArea from './components/GameArea';
import Scoreboard from './components/Scoreboard';
import ControlButtons from './components/ControlButtons';
import useGameLoop from './hooks/useGameLoop';
import './styles/animations.css';

const INITIAL_SCORE = {
  safe: 0,
  malicious: 0,
  missed: 0,
};

const PreciseCollisionGame = () => {
  const [packages, setPackages] = useState([]);
  const [score, setScore] = useState(INITIAL_SCORE);
  const [inspecting, setInspecting] = useState(false);
  const [currentInspection, setCurrentInspection] = useState(null);
  const [logoPosition, setLogoPosition] = useState('up');
  const [autoPilot, setAutoPilot] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [conveyorSpeed] = useState(140);

  const gameAreaRef = useRef(null);
  const logoHitscanRef = useRef(
    typeof window !== 'undefined' ? window.innerWidth / 2 : 0
  );
  const logoWidthRef = useRef(96);
  const packageWidthRef = useRef(64);
  const inspectionTimeoutRef = useRef(null);
  const gameActive = true;

  useEffect(() => {
    const updateHitscan = () => {
      if (gameAreaRef.current) {
        const { left, width } = gameAreaRef.current.getBoundingClientRect();
        logoHitscanRef.current = left + width / 2;
      } else if (typeof window !== 'undefined') {
        logoHitscanRef.current = window.innerWidth / 2;
      }
    };

    updateHitscan();
    window.addEventListener('resize', updateHitscan);

    return () => {
      window.removeEventListener('resize', updateHitscan);
      if (inspectionTimeoutRef.current) {
        clearTimeout(inspectionTimeoutRef.current);
      }
    };
  }, []);

  const findPackageAtInspectionLine = useCallback(() => {
    const inspectionPoint = logoHitscanRef.current;
    return packages.find(
      (pkg) =>
        pkg.status === 'unprocessed' &&
        inspectionPoint >= pkg.x &&
        inspectionPoint <= pkg.x + pkg.width
    );
  }, [packages]);

  const resolveInspection = useCallback(
    (pkg) => {
      if (!pkg) return;

      if (inspectionTimeoutRef.current) {
        clearTimeout(inspectionTimeoutRef.current);
      }

      setInspecting(true);
      setLogoPosition('down');
      setCurrentInspection(pkg.id);

      setPackages((prev) =>
        prev.map((item) =>
          item.id === pkg.id
            ? {
                ...item,
                status: 'inspecting',
                inspectionTime: Date.now(),
                hideQuestionMark: true,
              }
            : item
        )
      );

      const duration = pkg.type === 'malicious' ? 650 : 450;

      inspectionTimeoutRef.current = setTimeout(() => {
        setPackages((prev) =>
          prev.map((item) => {
            if (item.id !== pkg.id) return item;
            const isThreat = pkg.type === 'malicious';
            return {
              ...item,
              status: isThreat ? 'threat' : 'safe',
              inspectionTime: Date.now(),
              hideQuestionMark: true,
              resolved: true,
            };
          })
        );

        setScore((prev) => ({
          safe: prev.safe + (pkg.type === 'malicious' ? 0 : 1),
          malicious: prev.malicious + (pkg.type === 'malicious' ? 1 : 0),
          missed: prev.missed,
        }));

        setInspecting(false);
        setLogoPosition('up');
        setCurrentInspection(null);
      }, duration);
    },
    [setPackages, setScore]
  );

  const handleLogoClick = useCallback(() => {
    if (inspecting) return;
    const target = findPackageAtInspectionLine();
    if (target) {
      resolveInspection(target);
    }
  }, [findPackageAtInspectionLine, inspecting, resolveInspection]);

  useEffect(() => {
    if (!autoPilot || inspecting) return;
    const target = findPackageAtInspectionLine();
    if (target) {
      resolveInspection(target);
    }
  }, [autoPilot, inspecting, findPackageAtInspectionLine, resolveInspection]);

  useEffect(() => {
    const inspectionPoint = logoHitscanRef.current;
    let missedId = null;

    for (const pkg of packages) {
      if (
        pkg.status === 'unprocessed' &&
        pkg.type === 'malicious' &&
        pkg.x > inspectionPoint &&
        !pkg.missedFlag
      ) {
        missedId = pkg.id;
        break;
      }
    }

    if (!missedId) return;

    setPackages((prev) =>
      prev.map((pkg) =>
        pkg.id === missedId
          ? { ...pkg, status: 'missed', missedFlag: true, wasUnprocessed: true }
          : pkg
      )
    );

    setScore((prev) => ({
      ...prev,
      missed: prev.missed + 1,
    }));
  }, [packages, setPackages, setScore]);

  useGameLoop({
    gameActive,
    inspecting,
    autoPilot,
    logoPosition,
    packages,
    conveyorSpeed,
    setPackages,
    setScore,
    setInspecting,
    setCurrentInspection,
    setLogoPosition,
    gameAreaRef,
    logoHitscanRef,
    packageWidthRef,
  });

  const toggleDebugMode = () => setDebugMode((prev) => !prev);
  const toggleAutoPilot = () => setAutoPilot((prev) => !prev);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-900 text-white font-sans">
      <GameArea
        gameAreaRef={gameAreaRef}
        logoHitscanRef={logoHitscanRef}
        debugMode={debugMode}
        packages={packages}
        inspecting={inspecting}
        logoPosition={logoPosition}
        handleLogoClick={handleLogoClick}
        currentInspection={currentInspection}
        autoPilot={autoPilot}
        logoWidthRef={logoWidthRef}
      />

      <Scoreboard score={score} autoPilot={autoPilot} />

      <ControlButtons
        debugMode={debugMode}
        autoPilot={autoPilot}
        toggleDebugMode={toggleDebugMode}
        toggleAutoPilot={toggleAutoPilot}
        conveyorSpeed={conveyorSpeed}
      />
    </div>
  );
};

export default PreciseCollisionGame;
