import React, { useState } from 'react';
import { GameEngine } from '../core/GameEngine';

interface SongSelectProps {
  onStart: (songUrl: string, chartUrl: string) => void;
}

const SongSelect: React.FC<SongSelectProps> = ({ onStart }) => {
  const testSong = {
    title: 'Test Song',
    audio: '/assets/audio/test.mp3', // Note: Need actual file to play
    chart: '/assets/charts/test.json'
  };

  return (
    <div className="song-select">
      <h1>Plan-B RHYTHM</h1>
      <button onClick={() => onStart(testSong.audio, testSong.chart)}>
        Start Test Song
      </button>
      <style>{`
        .song-select {
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 2rem;
          border-radius: 1rem;
          text-align: center;
          pointer-events: auto;
        }
        button {
          padding: 1rem 2rem;
          font-size: 1.2rem;
          cursor: pointer;
          background: #00aaff;
          border: none;
          color: white;
          border-radius: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default SongSelect;
