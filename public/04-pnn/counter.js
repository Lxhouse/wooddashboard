'use client';
import React, { useState } from 'react';
import Confetti from 'react-dom-confetti';

export function Counter() {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    // Reset after 3 seconds
    setTimeout(() => setIsClicked(false), 3000);
  };

  const confettiConfig = {
    angle: 90,
    spread: 360,
    startVelocity: 40,
    elementCount: 150,
    dragFriction: 0.1,
    duration: 3000,
    stagger: 3,
    width: '15px',
    height: '15px',
    colors: ['#f44336', '#2196f3', '#ffeb3b', '#4caf50', '#ff9800', '#9c27b0'],
    shapes: ['square', 'circle'],
    scalar: 1.2,
  };

  return (
    <div className="flex justify-center ">
      <button
        className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
        onClick={handleClick}
      >
        点我，来点 赛伯朋克烟花庆祝下🎉
      </button>
      <Confetti active={isClicked} config={confettiConfig} />
    </div>
  );
}
