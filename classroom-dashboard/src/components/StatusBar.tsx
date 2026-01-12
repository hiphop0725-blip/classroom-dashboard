import React, { useState, useEffect, useRef } from 'react';
import { Mic, Timer, Pause, Play, RotateCcw } from 'lucide-react';
import { StatusMode } from '../types';

interface StatusBarProps {
    activeContext: {
        subject: string;
        timeLeft: number;
        isActive: boolean;
    };
}

export const StatusBar: React.FC<StatusBarProps> = ({ activeContext }) => {
  const [mode, setMode] = useState<StatusMode>(StatusMode.IDLE);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes default
  const [totalDuration, setTotalDuration] = useState(300); // Track total for progress bar
  const [isRunning, setIsRunning] = useState(false);
  const [volume, setVolume] = useState(0);
  
  // Audio Context Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Timer Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (mode === StatusMode.TIMER && isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [mode, isRunning, timeLeft]);

  // Update total duration if user adds time beyond current total
  const adjustTime = (delta: number) => {
      const newTime = Math.max(0, timeLeft + delta);
      setTimeLeft(newTime);
      if (newTime > totalDuration) {
          setTotalDuration(newTime);
      }
      // If we are adding time to a finished timer, we need to make sure the ended state clears visually
      // The logic below uses timeLeft === 0 to trigger the blue state, so setting it > 0 automatically reverts it.
  };

  const resetTimer = () => {
      setIsRunning(false);
      setTimeLeft(300);
      setTotalDuration(300);
  };

  // Noise Meter Logic
  const startNoiseMeter = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        const average = dataArrayRef.current.reduce((a, b) => a + b) / dataArrayRef.current.length;
        setVolume(average); // 0 to 255 roughly
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (err) {
      console.error("Error accessing microphone", err);
      alert("無法存取麥克風，請檢查權限設定。");
      setMode(StatusMode.IDLE);
    }
  };

  const stopNoiseMeter = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (sourceRef.current) sourceRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();
    setVolume(0);
  };

  useEffect(() => {
    if (mode === StatusMode.NOISE) {
      startNoiseMeter();
    } else {
      stopNoiseMeter();
    }
    return () => stopNoiseMeter();
  }, [mode]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Helper for background/progress colors
  const getProgressColor = (seconds: number) => {
      if (mode === StatusMode.TIMER && seconds === 0) return 'bg-sky-500'; // Darker blue for progress bar
      if (seconds <= 600) return 'bg-rose-500';
      if (seconds <= 1200) return 'bg-amber-400';
      return 'bg-emerald-500';
  };

  // Helper for text colors
  const getTextColor = (seconds: number) => {
      if (mode === StatusMode.TIMER && seconds === 0) return 'text-sky-600'; // Darker blue for text
      if (seconds <= 600) return 'text-rose-500';
      if (seconds <= 1200) return 'text-amber-500';
      return 'text-emerald-500';
  };

  // Determine indicator dot class
  const getIndicatorClass = () => {
      if (mode === StatusMode.IDLE) {
          return activeContext.isActive 
            ? `${getProgressColor(activeContext.timeLeft)} animate-pulse` 
            : 'bg-gray-200';
      }
      if (mode === StatusMode.TIMER) {
          if (timeLeft === 0) return 'bg-sky-500';
          return 'bg-green-500 animate-pulse';
      }
      return 'bg-emerald-500 animate-pulse';
  };

  // Check if Timer is Ended
  const isEnded = mode === StatusMode.TIMER && timeLeft === 0;

  // Dynamic Container Styles
  const containerClasses = isEnded 
    ? 'bg-sky-50 border-sky-300 shadow-md' 
    : 'bg-white border-gray-100 shadow-sm';
    
  // Dynamic Inner Box Styles
  const innerBoxClasses = isEnded
    ? 'bg-white/60 border-sky-100'
    : 'bg-white/80 border-gray-100';

  const progressPercentage = timeLeft === 0 ? 100 : Math.min(100, (timeLeft / totalDuration) * 100);

  return (
    <div className={`rounded-[2rem] p-4 flex flex-col justify-center items-center relative overflow-hidden h-full border transition-colors duration-500 ${containerClasses}`}>
      {/* Background Shapes */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
         <div className="w-[80%] h-[60%] bg-black rounded-full blur-3xl"></div>
      </div>

      <div className={`z-10 w-full max-w-2xl backdrop-blur rounded-3xl shadow-sm border p-4 flex items-center justify-between px-6 h-32 relative transition-colors duration-500 ${innerBoxClasses}`}>
        
        {/* Left Control / Status Indicator */}
        <div className="flex items-center space-x-4">
            <div className={`w-4 h-4 rounded-full transition-colors duration-500 shadow-sm ${getIndicatorClass()}`}></div>
            
            {mode === StatusMode.TIMER && (
                 <div className="flex space-x-1">
                    {/* Only show play/pause if time is not 0 */}
                    {!isEnded && (
                        <button onClick={() => setIsRunning(!isRunning)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-700 transition-transform active:scale-95">
                            {isRunning ? <Pause size={18}/> : <Play size={18}/>}
                        </button>
                    )}
                    <button onClick={resetTimer} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-700 transition-transform active:scale-95">
                        <RotateCcw size={18}/>
                    </button>
                 </div>
            )}
        </div>

        {/* Center Display Text */}
        <div className="flex-1 flex flex-col items-center justify-center overflow-hidden mx-4">
            {mode === StatusMode.IDLE && (
                <>
                    {activeContext.isActive ? (
                        <div className="w-full overflow-hidden">
                             <div className={`whitespace-nowrap animate-marquee text-2xl md:text-3xl font-bold transition-colors duration-1000 ${getTextColor(activeContext.timeLeft)}`}>
                                目前科目：{activeContext.subject} &nbsp;&nbsp;&nbsp; 距離下課還有 {Math.ceil(activeContext.timeLeft / 60)} 分鐘 &nbsp;&nbsp;&nbsp; 加油加油！💪 &nbsp;&nbsp;&nbsp;
                             </div>
                        </div>
                    ) : (
                        <span className="text-3xl md:text-4xl font-bold text-gray-300 tracking-widest">等待中</span>
                    )}
                </>
            )}
            {mode === StatusMode.TIMER && (
                <div className="flex flex-col items-center w-full max-w-[200px]">
                    {isEnded ? (
                        <span className="text-4xl md:text-5xl font-bold tracking-widest text-sky-600 animate-bounce mb-2">
                            已結束
                        </span>
                    ) : (
                        <span className={`text-5xl md:text-6xl font-mono font-bold leading-none mb-2 ${timeLeft < 60 ? 'text-rose-500 animate-pulse' : 'text-gray-700'}`}>
                            {formatTime(timeLeft)}
                        </span>
                    )}
                    
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-1000 ease-linear ${getProgressColor(timeLeft)}`}
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            )}
            {mode === StatusMode.NOISE && (
                <div className="w-full flex flex-col items-center">
                    <div className="w-full h-8 bg-gray-100 rounded-full overflow-hidden mb-2 border border-gray-200">
                        <div 
                            className={`h-full transition-all duration-100 ease-out ${volume > 100 ? 'bg-rose-500' : volume > 50 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                            style={{ width: `${Math.min((volume / 100) * 100, 100)}%` }}
                        />
                    </div>
                    <span className="text-gray-400 text-sm font-bold tracking-wide">音量監測中</span>
                </div>
            )}
        </div>

        {/* Right Mode Switchers */}
        <div className="flex flex-col space-y-2 ml-2">
            <button 
                onClick={() => setMode(StatusMode.IDLE)}
                className={`p-2 rounded-xl transition-all ${mode === StatusMode.IDLE ? 'bg-gray-800 text-white shadow-md' : 'bg-white/50 text-gray-400 hover:bg-white hover:text-gray-600'}`}
            >
                <div className="w-4 h-4 rounded-full border-2 border-current"></div>
            </button>
             <button 
                onClick={() => setMode(StatusMode.TIMER)}
                className={`p-2 rounded-xl transition-all ${mode === StatusMode.TIMER ? 'bg-indigo-500 text-white shadow-md' : 'bg-white/50 text-gray-400 hover:bg-white hover:text-gray-600'}`}
            >
                <Timer size={16}/>
            </button>
             <button 
                onClick={() => setMode(StatusMode.NOISE)}
                className={`p-2 rounded-xl transition-all ${mode === StatusMode.NOISE ? 'bg-emerald-500 text-white shadow-md' : 'bg-white/50 text-gray-400 hover:bg-white hover:text-gray-600'}`}
            >
                <Mic size={16}/>
            </button>
        </div>
      </div>
      
      {mode === StatusMode.TIMER && !isRunning && !isEnded && (
         <div className="absolute bottom-2 flex gap-2">
             <button onClick={() => adjustTime(60)} className="text-xs bg-white px-3 py-1 rounded-full shadow-sm text-gray-500 hover:text-indigo-600 border border-gray-100 transition-colors">+1分</button>
             <button onClick={() => adjustTime(-60)} className="text-xs bg-white px-3 py-1 rounded-full shadow-sm text-gray-500 hover:text-indigo-600 border border-gray-100 transition-colors">-1分</button>
         </div>
      )}
       
       {/* Reset button when ended, making it easy to restart */}
       {isEnded && (
           <div className="absolute bottom-2 flex gap-2 animate-fade-in">
              <button onClick={resetTimer} className="text-xs bg-sky-100 px-4 py-1.5 rounded-full shadow-sm text-sky-700 hover:bg-sky-200 border border-sky-200 transition-colors font-bold">
                  重置計時
              </button>
           </div>
       )}
    </div>
  );
};