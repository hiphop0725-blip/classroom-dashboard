import React, { useState } from 'react';

export const Attendance: React.FC = () => {
  const [expected, setExpected] = useState(30);
  const [actual, setActual] = useState(29);
  const [absentNote, setAbsentNote] = useState('');

  const absentCount = expected - actual;

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 h-full p-4 flex flex-col justify-between relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
            <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded-md tracking-wider">出席狀況</span>
             {absentCount > 0 && (
                <div className="animate-pulse bg-rose-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm">
                    缺 {absentCount}
                </div>
            )}
        </div>

      {/* Counters Row */}
      <div className="flex-1 flex items-center justify-around gap-2 mb-2">
          {/* Expected */}
          <div className="flex flex-col items-center group cursor-default">
            <span className="text-blue-400 font-bold text-[10px] uppercase tracking-wider mb-1">應到</span>
            <div className="flex items-center gap-1">
                <button onClick={() => setExpected(p => Math.max(0, p - 1))} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-300 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100">-</button>
                <span className="text-5xl font-mono font-bold text-gray-700 leading-none">{expected}</span>
                <button onClick={() => setExpected(p => p + 1)} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-300 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100">+</button>
            </div>
          </div>

          <div className="w-px h-12 bg-gray-100"></div>

          {/* Actual */}
          <div className="flex flex-col items-center group cursor-default">
            <span className="text-emerald-500 font-bold text-[10px] uppercase tracking-wider mb-1">實到</span>
             <div className="flex items-center gap-1">
                <button onClick={() => setActual(p => Math.max(0, p - 1))} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-300 hover:text-emerald-500 transition-colors opacity-0 group-hover:opacity-100">-</button>
                <span className={`text-5xl font-mono font-bold leading-none ${actual < expected ? 'text-rose-500' : 'text-emerald-600'}`}>{actual}</span>
                <button onClick={() => setActual(p => Math.min(expected, p + 1))} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-300 hover:text-emerald-500 transition-colors opacity-0 group-hover:opacity-100">+</button>
            </div>
          </div>
      </div>

      {/* Absent Input */}
      <div className="relative w-full">
        <input
            value={absentNote}
            onChange={(e) => setAbsentNote(e.target.value)}
            placeholder="未到說明..."
            className="w-full bg-gray-50 rounded-xl px-4 py-2 text-sm text-center text-gray-600 outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder-gray-400"
        />
      </div>
    </div>
  );
};
