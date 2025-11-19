import React from 'react';

const Scoreboard = ({ score, isGameOver }) => {
  return (
    <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-4 flex items-center justify-between">
      <div>
        <div className="text-xs uppercase tracking-wide text-gray-500">Score</div>
        <div className="text-4xl font-bold text-purple-600">{score}</div>
      </div>
      <div className="text-right">
        <div className="text-xs uppercase tracking-wide text-gray-500">Status</div>
        <div className="text-lg font-semibold text-gray-700">
          {isGameOver ? 'Game Over' : 'Running'}
        </div>
      </div>
    </div>
  );
};

export default Scoreboard;
