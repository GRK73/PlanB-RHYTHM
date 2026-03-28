import React, { useState, useRef, useEffect, useCallback } from 'react';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [offset, setOffset] = useState(() => {
    return parseInt(localStorage.getItem('audioOffset') || '0', 10);
  });
  const [calibrating, setCalibrating] = useState(false);
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [calibBpm] = useState(120);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextTickRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const tickCountRef = useRef<number>(0);

  const msPerBeat = (60 / calibBpm) * 1000;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  const playTick = useCallback((ctx: AudioContext) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 1200;
    gain.gain.value = 0.3;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.025);
  }, []);

  const startCalibration = () => {
    setCalibrating(true);
    setTapTimes([]);
    tickCountRef.current = 0;

    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    startTimeRef.current = performance.now();
    nextTickRef.current = 0;

    // Play first tick immediately
    playTick(ctx);
    tickCountRef.current = 1;
    nextTickRef.current = msPerBeat;

    const timer = setInterval(() => {
      const elapsed = performance.now() - startTimeRef.current;
      if (elapsed >= nextTickRef.current) {
        playTick(ctx);
        tickCountRef.current++;
        nextTickRef.current += msPerBeat;
      }
    }, 1);

    timerRef.current = timer as unknown as number;
  };

  const stopCalibration = () => {
    setCalibrating(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }

    // Calculate offset from tap times
    if (tapTimes.length >= 4) {
      // Each tap should align with a beat. Calculate the average difference.
      const diffs = tapTimes.map((t) => {
        // The expected beat time for this tap
        // First tap maps to the closest beat
        const beatIndex = Math.round(t / msPerBeat);
        const expectedTime = beatIndex * msPerBeat;
        return t - expectedTime;
      });
      
      // Remove outliers (first tap often inaccurate)
      const trimmed = diffs.slice(1);
      const avgDiff = trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
      const newOffset = Math.round(avgDiff);
      setOffset(newOffset);
      localStorage.setItem('audioOffset', String(newOffset));
    }
  };

  const handleTap = () => {
    if (!calibrating) return;
    const tapTime = performance.now() - startTimeRef.current;
    setTapTimes(prev => [...prev, tapTime]);
  };

  const handleOffsetChange = (val: number) => {
    setOffset(val);
    localStorage.setItem('audioOffset', String(val));
  };

  return (
    <div className="settings-backdrop" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <h2>⚙️ Settings</h2>
          <button className="settings-close" onClick={onClose}>✕</button>
        </div>

        <div className="settings-section">
          <h3>Audio Offset</h3>
          <p className="settings-desc">
            노트 판정 타이밍을 조절합니다. 양수 값은 노트를 늦게, 음수 값은 빠르게 판정합니다.
          </p>
          
          <div className="offset-control">
            <button onClick={() => handleOffsetChange(offset - 5)}>-5</button>
            <button onClick={() => handleOffsetChange(offset - 1)}>-1</button>
            <div className="offset-value">{offset}ms</div>
            <button onClick={() => handleOffsetChange(offset + 1)}>+1</button>
            <button onClick={() => handleOffsetChange(offset + 5)}>+5</button>
          </div>
          
          <input 
            type="range" 
            min="-200" 
            max="200" 
            value={offset} 
            onChange={e => handleOffsetChange(Number(e.target.value))}
            className="offset-slider"
          />
        </div>

        <div className="settings-section">
          <h3>Offset Calibration</h3>
          <p className="settings-desc">
            메트로놈 소리에 맞춰 탭하면 자동으로 오프셋을 계산합니다.
          </p>
          
          {!calibrating ? (
            <button className="calibrate-btn" onClick={startCalibration}>
              🎵 Start Calibration
            </button>
          ) : (
            <div className="calibration-area">
              <div className="tap-count">Taps: {tapTimes.length} / 8+</div>
              <button className="tap-btn" onClick={handleTap}>
                TAP
              </button>
              <p className="tap-hint">메트로놈 소리에 맞춰 TAP 버튼을 누르세요</p>
              <button className="calibrate-stop-btn" onClick={stopCalibration}>
                Stop & Apply
              </button>
            </div>
          )}
        </div>

        <style>{`
          .settings-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(4px); }
          .settings-modal { background: #1e1e2e; border: 1px solid #3d3d5c; border-radius: 16px; padding: 28px; width: 400px; max-width: 90vw; color: white; font-family: 'Segoe UI', sans-serif; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
          .settings-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #333; padding-bottom: 12px; }
          .settings-header h2 { margin: 0; font-size: 1.3rem; }
          .settings-close { background: none; border: none; color: #888; font-size: 1.4rem; cursor: pointer; padding: 4px 8px; border-radius: 4px; }
          .settings-close:hover { color: white; background: #333; }
          .settings-section { margin-bottom: 24px; }
          .settings-section h3 { margin: 0 0 6px 0; font-size: 1rem; color: #ccc; }
          .settings-desc { font-size: 0.8rem; color: #777; margin: 0 0 12px 0; line-height: 1.4; }
          .offset-control { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 10px; }
          .offset-control button { padding: 6px 14px; background: #2a2a4a; border: 1px solid #444; color: white; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 0.85rem; }
          .offset-control button:hover { background: #3a3a6a; }
          .offset-value { font-size: 1.5rem; font-weight: bold; font-family: monospace; color: #00d2ff; min-width: 80px; text-align: center; }
          .offset-slider { width: 100%; accent-color: #00d2ff; }
          .calibrate-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; color: white; font-weight: bold; font-size: 1rem; border-radius: 8px; cursor: pointer; }
          .calibrate-btn:hover { filter: brightness(1.1); }
          .calibration-area { display: flex; flex-direction: column; align-items: center; gap: 10px; }
          .tap-count { font-size: 0.9rem; color: #aaa; font-family: monospace; }
          .tap-btn { width: 140px; height: 140px; border-radius: 50%; background: linear-gradient(135deg, #f59e0b, #ef4444); border: 4px solid rgba(255,255,255,0.2); color: white; font-size: 1.5rem; font-weight: bold; cursor: pointer; user-select: none; transition: transform 0.05s; }
          .tap-btn:active { transform: scale(0.92); }
          .tap-hint { font-size: 0.75rem; color: #888; margin: 0; }
          .calibrate-stop-btn { padding: 8px 20px; background: #e74c3c; border: none; color: white; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 0.85rem; }
        `}</style>
      </div>
    </div>
  );
};

export default SettingsModal;
