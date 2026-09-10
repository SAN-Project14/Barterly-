import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, Sparkles } from 'lucide-react';

interface BrandIntroProps {
  onComplete: () => void;
}

export function BrandIntro({ onComplete }: BrandIntroProps) {
  const [phase, setPhase] = useState<number>(1); // 1: logo, 2: name, 3: tagline, 4: transition, 5: finish
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    // Total 5.0 seconds sequence:
    // 0.0s - 1.0s: Logo appears & pulses
    // 1.0s - 2.2s: Name appears
    // 2.2s - 4.2s: Tagline appears
    // 4.2s - 5.0s: Polished transition to main experience
    const timer1 = setTimeout(() => setPhase(2), 1000);
    const timer2 = setTimeout(() => setPhase(3), 2200);
    const timer3 = setTimeout(() => setPhase(4), 4200);
    const timer4 = setTimeout(() => {
      setPhase(5);
      onComplete();
    }, 5000);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 2, 100));
    }, 100);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') {
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearInterval(progressInterval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete]);

  return (
    <div 
      id="barterly-brand-intro"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950 text-neutral-50 select-none transition-opacity duration-700 ${phase === 4 ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100'}`}
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl transform -rotate-12 animate-pulse" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-2xl" />
      </div>

      <div className="relative flex flex-col items-center text-center px-6 max-w-lg">
        {/* Step 1: Barterly Logo */}
        <div 
          id="intro-logo" 
          className={`relative mb-6 transform transition-all duration-700 ease-out ${phase >= 1 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-4'}`}
        >
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-neutral-900 to-neutral-800 border border-neutral-700/80 shadow-2xl flex items-center justify-center p-5">
            <div className="w-full h-full rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center">
              <ArrowLeftRight className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400 stroke-[2.2] animate-pulse" />
            </div>
            {/* Subtle glow dot */}
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-4 ring-neutral-950" />
          </div>
        </div>

        {/* Step 2: Barterly Name */}
        <div 
          id="intro-brand-name" 
          className={`transform transition-all duration-700 delay-100 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
        >
          <div className="inline-flex items-center gap-2 mb-2">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-sans">
              Barterly
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
              v1.0
            </span>
          </div>
        </div>

        {/* Step 3: Tagline */}
        <div 
          id="intro-tagline" 
          className={`transform transition-all duration-700 delay-200 mt-2 ${phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <p className="text-lg sm:text-xl font-medium text-emerald-400/95 tracking-wide">
            Trade What You Have. Get What You Want.
          </p>
          <p className="text-sm text-neutral-400 mt-2 max-w-sm mx-auto leading-relaxed">
            The modern cashless exchange platform built for fair item-to-item bartering.
          </p>
        </div>

        {/* 5-second progress ticker */}
        <div className="w-48 h-1 bg-neutral-800 rounded-full mt-10 overflow-hidden">
          <div 
            className="h-full bg-emerald-400 transition-all duration-100 ease-linear rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Accessible skip button */}
      <button
        id="intro-skip-btn"
        onClick={onComplete}
        className="absolute bottom-8 text-xs text-neutral-400 hover:text-white px-4 py-2 rounded-full border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm transition-colors cursor-pointer flex items-center gap-1.5"
      >
        <span>Skip Intro</span>
        <span className="text-[10px] text-neutral-500 uppercase tracking-wider">(Esc)</span>
      </button>
    </div>
  );
}
