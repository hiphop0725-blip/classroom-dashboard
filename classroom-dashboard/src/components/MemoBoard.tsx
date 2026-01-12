import React, { useState, useEffect } from 'react';
import { Edit3, CheckCircle, Turtle, Rabbit } from 'lucide-react';

const DEFAULT_MEMO = '🔔 考試注意事項： 1. 手機請關機或交出 📵  2. 桌面請保持淨空，只留文具 🧹  3. 寫完請仔細檢查名字和答案 📝  4. 保持安靜，有問題請舉手 🙋‍♂️  5. 祝大家考試順利，發揮實力！ 💯  ';

export const MemoBoard: React.FC = () => {
  // Initialize from localStorage
  const [memo, setMemo] = useState(() => {
    return localStorage.getItem('classroom_memo') || DEFAULT_MEMO;
  });
  
  const [isEditing, setIsEditing] = useState(false);
  // Duration in seconds: Higher number = Slower speed
  // Default: 60s
  const [duration, setDuration] = useState(60); 

  // Max duration for the slider (slower speed)
  const MAX_DURATION = 600; 
  const MIN_DURATION = 10;

  // Save to localStorage when memo changes
  useEffect(() => {
    localStorage.setItem('classroom_memo', memo);
  }, [memo]);

  return (
    <div className="bg-[#fffbeb] relative h-full flex flex-col overflow-hidden rounded-[2rem] border border-yellow-100 shadow-sm ml-2 md:ml-0">
      {/* Header Tag */}
      <div className="absolute top-0 left-0 z-20 flex items-center">
        <div className="bg-[#facc15] text-yellow-900 px-6 py-2 shadow-sm rounded-br-2xl font-bold tracking-wide flex items-center gap-2 text-sm md:text-base">
            <span>提醒事項</span>
            <div className="flex gap-1 ml-2 border-l border-yellow-600/20 pl-2">
                <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className={`p-1.5 rounded-full transition-colors ${isEditing ? 'bg-yellow-800 text-yellow-300' : 'bg-yellow-200/50 hover:bg-yellow-100 text-yellow-800'}`}
                    title={isEditing ? "完成編輯" : "編輯公告"}
                >
                    {isEditing ? <CheckCircle size={14} /> : <Edit3 size={14} />}
                </button>
            </div>
        </div>
        
        {/* Speed Control (Visible when not editing) */}
        {!isEditing && (
            <div className="ml-4 bg-white/50 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2 opacity-0 hover:opacity-100 transition-opacity group">
                <Turtle size={14} className="text-gray-500" />
                <input 
                    type="range" 
                    min={MIN_DURATION}
                    max={MAX_DURATION}
                    step="10"
                    value={MAX_DURATION - duration + MIN_DURATION} 
                    onChange={(e) => setDuration(MAX_DURATION - parseInt(e.target.value) + MIN_DURATION)}
                    className="w-24 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                    title="調整跑馬燈速度"
                />
                <Rabbit size={14} className="text-gray-500" />
            </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {isEditing ? (
             <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="w-full h-full bg-white/50 rounded-xl p-8 text-center text-4xl font-bold text-gray-700 resize-none outline-none focus:ring-2 focus:ring-yellow-400 placeholder-gray-300"
                placeholder="請輸入公告事項..."
            />
        ) : (
            <div className="w-full overflow-hidden flex items-center h-full">
                <div 
                    className="whitespace-nowrap animate-marquee text-[5rem] md:text-[6rem] lg:text-[7rem] font-bold text-yellow-900/80 leading-none"
                    style={{ animationDuration: `${duration}s` }}
                >
                    {memo} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {memo}
                </div>
            </div>
        )}
       
      </div>

      {/* Caution Stripes */}
      <div className="h-6 w-full stripe-pattern border-t border-yellow-300"></div>
    </div>
  );
};