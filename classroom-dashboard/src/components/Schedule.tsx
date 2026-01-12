import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, XCircle, Check } from 'lucide-react';
import { ScheduleItem } from '../types';

interface ScheduleProps {
  onActiveContextChange: (context: { subject: string; timeLeft: number; isActive: boolean }) => void;
}

const DEFAULT_SCHEDULE: ScheduleItem[] = [
    { id: '1', subject: '早自習', time: '07:50~08:30', isActive: false },
    { id: '2', subject: '第一節', time: '08:40~09:20', isActive: false },
    { id: '3', subject: '第二節', time: '09:30~10:10', isActive: false },
    { id: '4', subject: '第三節', time: '10:30~11:10', isActive: false },
    { id: '5', subject: '午休', time: '12:30~13:00', isActive: false },
    { id: '6', subject: '第五節', time: '13:10~13:50', isActive: false },
];

export const Schedule: React.FC<ScheduleProps> = ({ onActiveContextChange }) => {
  // Initialize state from localStorage or use default
  const [items, setItems] = useState<ScheduleItem[]>(() => {
    try {
        const saved = localStorage.getItem('classroom_schedule');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error("Failed to load schedule", e);
    }
    return DEFAULT_SCHEDULE;
  });

  const [now, setNow] = useState(new Date());
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('classroom_schedule', JSON.stringify(items));
  }, [items]);

  // Helper to parse time string "HH:MM" safely
  const parseTime = (timeStr: string | undefined) => {
    if (!timeStr) return new Date();
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0] || '0', 10);
    const minutes = parseInt(parts[1] || '0', 10);
    
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Helper for color logic (Background colors)
  const getProgressColor = (seconds: number) => {
    if (seconds <= 600) return 'bg-rose-400'; // < 10 mins
    if (seconds <= 1200) return 'bg-amber-300'; // 10-20 mins
    return 'bg-emerald-300'; // > 20 mins
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const currentTime = new Date();
      setNow(currentTime);
      
      let foundActive = false;
      let currentSubject = '';
      let secondsLeft = 0;

      // Logic to find current active class for parent component
      items.forEach(item => {
        if (!item.time.includes('~')) return;
        const [startStr, endStr] = item.time.split('~');
        if (!startStr || !endStr) return;

        const startTime = parseTime(startStr);
        const endTime = parseTime(endStr);

        if (currentTime >= startTime && currentTime <= endTime) {
          foundActive = true;
          currentSubject = item.subject;
          secondsLeft = Math.floor((endTime.getTime() - currentTime.getTime()) / 1000);
        }
      });
      
      onActiveContextChange({
        isActive: foundActive,
        subject: currentSubject,
        timeLeft: secondsLeft
      });

    }, 1000);

    return () => clearInterval(timer);
  }, [items, onActiveContextChange]);

  const addItem = () => {
      const newItem: ScheduleItem = {
          id: Date.now().toString(),
          subject: '新課程',
          time: '00:00~00:00',
          isActive: false
      };
      setItems([...items, newItem]);
      setIsDeleteMode(false); // Switch back to edit mode when adding
  };

  const deleteItem = (id: string) => {
      setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: 'subject' | 'time', value: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  // Safe check for active item
  const isItemActive = (itemTime: string) => {
      if (!itemTime || !itemTime.includes('~')) return false;
      const [startStr, endStr] = itemTime.split('~');
      if (!startStr || !endStr) return false;

      const startTime = parseTime(startStr);
      const endTime = parseTime(endStr);
      return now >= startTime && now <= endTime;
  };

  // Render Full Background Progress Bar
  const renderProgressBar = (itemTime: string) => {
      if (!itemTime.includes('~')) return null;
      const [startStr, endStr] = itemTime.split('~');
      
      const startTime = parseTime(startStr).getTime();
      const endTime = parseTime(endStr).getTime();
      const currentTime = now.getTime();
      
      if (currentTime < startTime || currentTime > endTime) return null;

      const totalDuration = endTime - startTime;
      const elapsed = currentTime - startTime;
      const percent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
      const timeLeftSec = (endTime - currentTime) / 1000;

      return (
        <div className="absolute inset-0 z-0 pointer-events-none">
             {/* Background container */}
             <div className="w-full h-full bg-gray-50/50">
                 {/* Moving fill */}
                 <div 
                    className={`h-full transition-all duration-1000 ease-linear ${getProgressColor(timeLeftSec)}`}
                    style={{ width: `${percent}%`, opacity: 0.4 }} 
                 />
             </div>
        </div>
      );
  };

  return (
    <div className={`flex flex-col h-full overflow-hidden relative transition-colors duration-300 ${isDeleteMode ? 'bg-red-50' : 'bg-white'}`}>
        <div className={`p-4 backdrop-blur-sm border-b flex justify-between items-center z-20 sticky top-0 transition-colors ${isDeleteMode ? 'bg-red-100/80 border-red-200' : 'bg-white/80 border-gray-100'}`}>
             <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl shadow-sm transition-colors ${isDeleteMode ? 'bg-red-200 text-red-600' : 'bg-indigo-50 text-indigo-500'}`}>
                    <Clock size={18} />
                </div>
                <span className={`text-base font-bold tracking-wider ${isDeleteMode ? 'text-red-700' : 'text-gray-700'}`}>
                    {isDeleteMode ? '刪除模式' : '今日課程'}
                </span>
             </div>
             
             <div className="flex gap-2">
                 <button 
                    onClick={() => setIsDeleteMode(!isDeleteMode)}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-bold transition-all shadow-sm ${
                        isDeleteMode 
                        ? 'bg-red-500 text-white hover:bg-red-600' 
                        : 'bg-white border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200'
                    }`}
                 >
                    {isDeleteMode ? (
                        <>
                            <Check size={16} /> <span>完成</span>
                        </>
                    ) : (
                        <>
                            <Trash2 size={16} /> <span>刪除</span>
                        </>
                    )}
                 </button>
                 {!isDeleteMode && (
                     <button 
                        onClick={addItem}
                        className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                        title="新增節次"
                     >
                        <Plus size={18} />
                     </button>
                 )}
             </div>
        </div>
        
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {items.map((item) => {
          const active = isItemActive(item.time);
          return (
          <div 
            key={item.id} 
            className={`group relative flex items-center justify-between p-4 rounded-2xl transition-all duration-300 overflow-hidden border 
                ${active ? 'border-indigo-200 shadow-md scale-[1.01] z-10' : 'bg-white border-gray-100'}
                ${isDeleteMode ? 'border-red-200 bg-red-50/50 hover:bg-red-100 cursor-pointer' : 'hover:border-gray-300'}
            `}
            onClick={() => {
                if(isDeleteMode) deleteItem(item.id);
            }}
          >
            {active && !isDeleteMode && renderProgressBar(item.time)}
            
            <div className="flex-1 grid grid-cols-12 gap-4 items-center z-10 relative pointer-events-none md:pointer-events-auto">
              <input
                disabled={isDeleteMode}
                value={item.subject}
                onChange={(e) => updateItem(item.id, 'subject', e.target.value)}
                className={`col-span-5 bg-transparent font-bold text-2xl md:text-3xl outline-none focus:underline truncate disabled:opacity-50 disabled:cursor-not-allowed ${active ? 'text-indigo-900 drop-shadow-sm' : 'text-gray-700'}`}
              />
              <div className="col-span-7 flex justify-end items-center gap-4">
                <input
                    disabled={isDeleteMode}
                    value={item.time}
                    onChange={(e) => updateItem(item.id, 'time', e.target.value)}
                    className={`bg-transparent text-xl md:text-2xl font-mono text-right outline-none focus:underline w-full disabled:opacity-50 disabled:cursor-not-allowed ${active ? 'text-indigo-800 font-bold' : 'text-gray-400'}`}
                />
                
                {isDeleteMode && (
                    <div className="bg-red-500 text-white p-2 rounded-full shadow-lg animate-in fade-in zoom-in duration-200">
                        <XCircle size={24} />
                    </div>
                )}
              </div>
            </div>
            
            {/* Visual overlay for delete mode to make whole row clickable */}
            {isDeleteMode && (
                <div className="absolute inset-0 z-50 cursor-pointer" onClick={() => deleteItem(item.id)}></div>
            )}
          </div>
        )})}
        
        {items.length === 0 && (
            <div className="h-40 flex flex-col items-center justify-center text-gray-400">
                <p>目前沒有課程</p>
                <button onClick={addItem} className="text-indigo-500 underline mt-2">新增一節</button>
            </div>
        )}
      </div>
    </div>
  );
};