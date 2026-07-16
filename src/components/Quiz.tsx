import { motion, AnimatePresence } from 'motion/react';
import { Home } from 'lucide-react';
import React, { useState } from 'react';
import { QUESTIONS } from '../data';

interface QuizProps {
  name: string;
  onComplete: (scores: Record<string, number>) => void;
  onRestart: () => void;
}

export default function Quiz({ name, onComplete, onRestart }: QuizProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({
    sp_su: 0,
    fa_wi: 0,
    sp_fa: 0,
    su_wi: 0,
    p: 0,
    n: 0,
  });

  const question = QUESTIONS[currentIdx];
  const progress = ((currentIdx) / QUESTIONS.length) * 100;

  const handleAnswer = (value: string) => {
    const newScores = { ...scores, [value]: scores[value] + 1 };
    
    if (currentIdx < QUESTIONS.length - 1) {
      setScores(newScores);
      setCurrentIdx(currentIdx + 1);
    } else {
      onComplete(newScores);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-12 gap-4 w-full h-full max-h-[800px]">
        {/* Progress Card */}
        <div className="col-span-12 bg-white border border-[#E2E8F0] rounded-[20px] p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] flex items-center gap-4">
          <button 
            onClick={onRestart}
            className="p-2 -ml-2 text-[#777777] hover:text-[#282828] hover:bg-black/5 rounded-full transition-colors flex-shrink-0"
            title="처음으로 돌아가기"
          >
            <Home size={20} />
          </button>
          <div className="flex-1 bg-black/5 rounded-full h-2 overflow-hidden">
            <motion.div
              className="bg-[#282828] h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-sm font-bold text-[#777777] whitespace-nowrap">
            {currentIdx + 1} / {QUESTIONS.length}
          </span>
        </div>

        <div className="col-span-12 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-12 gap-4 w-full"
            >
              {/* Question Card */}
              <div className="col-span-12 md:col-span-5 bg-[#282828] text-white rounded-[20px] p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] flex flex-col justify-center min-h-[200px]">
                <span className="text-xs font-medium uppercase tracking-wider text-[#e1e5fe] mb-4 block">
                  질문 {currentIdx + 1}
                </span>
                <h2 className="text-2xl font-bold leading-tight break-keep">
                  {question.text.replace(/캐릭터\/페어/g, name)}
                </h2>
              </div>

              {/* Answers Card */}
              <div className="col-span-12 md:col-span-7 grid grid-rows-2 gap-4">
                {question.answers.map((answer, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(answer.value)}
                    className="w-full text-left p-6 rounded-[20px] border border-[#E2E8F0] bg-white hover:border-[#282828] hover:shadow-md transition-all focus:outline-none flex items-center group shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]"
                  >
                    <div className="min-w-[2.5rem] w-10 h-10 bg-black/5 group-hover:bg-[#e1e5fe] rounded-lg flex items-center justify-center text-[#777777] group-hover:text-[#282828] font-bold mr-4 transition-colors">
                      {['A', 'B'][idx]}
                    </div>
                    <p className="text-[#222222] break-keep leading-relaxed font-semibold">
                      {answer.text}
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
