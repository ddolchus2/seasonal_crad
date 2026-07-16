/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AnimatePresence } from 'motion/react';
import React, { useState } from 'react';
import Intro from './components/Intro';
import Quiz from './components/Quiz';
import Result from './components/Result';

type AppState = 'intro' | 'quiz' | 'result';

export default function App() {
  const [appState, setAppState] = useState<AppState>('intro');
  const [name, setName] = useState('');
  const [scores, setScores] = useState<Record<string, number>>({});

  const handleStart = (inputName: string) => {
    setName(inputName);
    setAppState('quiz');
  };

  const handleQuizComplete = (finalScores: Record<string, number>) => {
    setScores(finalScores);
    setAppState('result');
  };

  const handleRestart = () => {
    setAppState('intro');
    setName('');
    setScores({});
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#222222] font-sans selection:bg-[#e1e5fe] leading-[1.5]">
      <AnimatePresence mode="wait">
        {appState === 'intro' && (
          <Intro key="intro" onStart={handleStart} />
        )}
        {appState === 'quiz' && (
          <Quiz key="quiz" name={name} onComplete={handleQuizComplete} onRestart={handleRestart} />
        )}
        {appState === 'result' && (
          <Result key="result" name={name} scores={scores} onRestart={handleRestart} />
        )}
      </AnimatePresence>
    </div>
  );
}
