import React, { useState, useEffect, useRef } from 'react';
import './AudioPlayer.css';

const AudioPlayer = ({ src, autoPlay, onEnded }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (autoPlay) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [autoPlay]);

  const updateProgress = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      const totalDuration = audioRef.current.duration;
      setProgress((currentTime / totalDuration) * 100);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    if (onEnded) {
      onEnded();
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressChange = (e) => {
    const newTime = (e.target.value / 100) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setProgress(e.target.value);
    }
  };

  return (
    <div className="audio-player">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={updateProgress}
        onDurationChange={(e) => setDuration(e.target.duration)}
        onEnded={handleEnded}
      />
      <div className="audio-controls">
        <button className="play-button" onClick={togglePlay}>
          {isPlaying ? '일시정지' : '재생'}
        </button>
        <div className="progress-container">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleProgressChange}
            className="progress-bar"
          />
          <div className="time-display">
            {Math.floor(audioRef.current?.currentTime || 0)}초 / {Math.floor(duration)}초
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
