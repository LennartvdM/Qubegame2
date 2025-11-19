import React from 'react';

const ControlButtons = ({ isRunning, toggleGame, handleStop, triggerBurst }) => {
  return (
    <div className="w-full max-w-lg flex flex-col sm:flex-row gap-3">
      <button
        onClick={toggleGame}
        className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-purple-700 transition"
      >
        {isRunning ? 'Pause' : 'Start'}
      </button>

      <button
        onClick={handleStop}
        className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-blue-600 transition"
      >
        Stop
      </button>

      <button
        onClick={triggerBurst}
        className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-orange-600 transition"
      >
        Burst
      </button>
    </div>
  );
};

export default ControlButtons;
