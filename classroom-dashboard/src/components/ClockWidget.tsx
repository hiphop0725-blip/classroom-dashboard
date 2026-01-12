import React, { useState, useEffect } from 'react';
import { RotateCcw, ChevronUp, ChevronDown } from 'lucide-react';

export const ClockWidget: React.FC = () => {
  const [offset, setOffset] = useState(0); // Offset in milliseconds
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      // Always update time based on real system time + offset
      setTime(new Date(Date.now() + offset));
    }, 1000);
    return () => clearInterval(timer);
  }, [offset]);

  const adjustTime = (type: 'hour' | 'minute', amount: number) => {
    // amount should be 1 or -1
    const milliseconds = type === 'hour' ? amount * 60 * 60 * 1000 : amount * 60 * 1000;
    setOffset((prev) => prev + milliseconds);
  };

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-4 flex flex-col items-center justify-between relative h-full group overflow-hidden">
      
      {/* Header */}
      <div className="bg-indigo-50 px-6 py-2 rounded-full mt-2">
        <div className="text-indigo-600 text-xl font-bold tracking-[0.1em]">現在時間</div>
      </div>
      
      {/* Main Time Display - Optimized Size */}
      <div className="flex-1 flex items-center justify-center w-full my-2">
          <div className="text-5xl lg:text-6xl xl:text-7xl font-mono font-bold text-gray-800 tracking-wider tabular-nums leading-none drop-shadow-sm scale-y-110">
            {formattedTime}
          </div>
      </div>

      {/* Control Panel */}
      <div className="w-full bg-gray-50 rounded-2xl p-3 flex items-center justify-around gap-2">
          
          {/* Hour Controls */}
          <div className="flex flex-col items-center gap-1">
             <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">時</span>
             <div className="flex gap-2">
                 <button 
                    onClick={() => adjustTime('hour', -1)}
                    className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 active:scale-95 transition-all shadow-sm"
                 >
                    <ChevronDown size={20} />
                 </button>
                 <button 
                    onClick={() => adjustTime('hour', 1)}
                    className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 active:scale-95 transition-all shadow-sm"
                 >
                    <ChevronUp size={20} />
                 </button>
             </div>
          </div>

          <div className="w-px h-10 bg-gray-200"></div>

          {/* Minute Controls */}
          <div className="flex flex-col items-center gap-1">
             <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">分</span>
             <div className="flex gap-2">
                <button 
                    onClick={() => adjustTime('minute', -1)}
                    className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 active:scale-95 transition-all shadow-sm"
                 >
                    <ChevronDown size={20} />
                 </button>
                 <button 
                    onClick={() => adjustTime('minute', 1)}
                    className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 active:scale-95 transition-all shadow-sm"
                 >
                    <ChevronUp size={20} />
                 </button>
             </div>
          </div>

          <div className="w-px h-10 bg-gray-200"></div>

          {/* Reset */}
          <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">校正</span>
              <button 
                onClick={() => setOffset(0)} 
                className="w-10 h-10 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-100 active:scale-95 transition-all shadow-sm" 
                title="重置為系統時間"
              >
                <RotateCcw size={18} />
            </button>
          </div>
      </div>
    </div>
  );
};