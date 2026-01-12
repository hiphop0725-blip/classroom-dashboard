import React, { useState } from 'react';
import { ClockWidget } from './components/ClockWidget';
import { StatusBar } from './components/StatusBar';
import { Schedule } from './components/Schedule';
import { Attendance } from './components/Attendance';
import { MemoBoard } from './components/MemoBoard';

function App() {
  // State to share active class info between Schedule and StatusBar
  const [activeContext, setActiveContext] = useState<{
    subject: string;
    timeLeft: number; // in seconds
    isActive: boolean;
  }>({ subject: '', timeLeft: 0, isActive: false });

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 flex items-center justify-center font-sans">
      <div className="max-w-[1800px] w-full bg-white shadow-2xl rounded-[2.5rem] overflow-hidden grid grid-cols-12 grid-rows-[auto_1fr] md:h-[92vh] ring-8 ring-white/50 gap-1 p-1">
        
        {/* --- Top Row --- */}
        
        {/* 1. Clock (Left) */}
        <div className="col-span-12 md:col-span-3 h-40 md:h-auto">
          <ClockWidget />
        </div>

        {/* 2. Status Bar (Center) */}
        <div className="col-span-12 md:col-span-6 h-40 md:h-auto">
          <StatusBar activeContext={activeContext} />
        </div>

        {/* 3. Attendance (Right - Moved here) */}
        <div className="col-span-12 md:col-span-3 h-40 md:h-auto">
             <Attendance />
        </div>

        {/* --- Bottom Row --- */}

        {/* 4. Schedule (Left - Expanded width & height) */}
        <div className="col-span-12 md:col-span-5 h-full overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm mt-2 md:mt-0">
            <Schedule onActiveContextChange={setActiveContext} />
        </div>

        {/* 5. Memo Board (Right - Slightly shrunk width) */}
        <div className="col-span-12 md:col-span-7 h-full min-h-[300px] mt-2 md:mt-0">
          <MemoBoard />
        </div>

      </div>
    </div>
  );
}

export default App;
