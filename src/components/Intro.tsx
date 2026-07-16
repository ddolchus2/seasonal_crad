import { motion } from 'motion/react';
import React, { useState } from 'react';

interface IntroProps {
  onStart: (name: string) => void;
}

export default function Intro({ onStart }: IntroProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onStart(name.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex items-center justify-center min-h-screen p-6 max-w-4xl mx-auto"
    >
      <div className="grid grid-cols-12 gap-4 w-full">
        {/* Header Card */}
        <div className="col-span-12 bg-white border border-[#E2E8F0] rounded-[20px] p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] flex flex-col justify-center text-left">
          <h1 className="text-4xl font-bold text-[#222222] tracking-tight">
            사계절 진단기
          </h1>
          <p className="text-[#777777] mt-2">
            캐릭터나 페어의 성향을 진단하고 계절 테마 카드를 만들어보세요.
          </p>
        </div>
        
        {/* Input Form Card */}
        <div className="col-span-12 bg-[#282828] rounded-[20px] p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 10자 내로 입력하세요"
                maxLength={10}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e1e5fe] transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full sm:w-auto bg-[#e1e5fe] text-[#222222] font-bold py-3 px-8 rounded-xl hover:bg-[#d0d6fd] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              진단 시작하기
            </button>
          </form>
        </div>
        
        {/* Footer Info */}
        <div className="col-span-12 text-center mt-2">
          <p className="text-xs text-[#777777]">
            2인 페어를 상정하여 작성되었으나 1인 혹은 다인 또한 사용 가능합니다.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
