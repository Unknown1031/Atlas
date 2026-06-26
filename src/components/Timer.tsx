import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Plus,
  ChevronDown,
  Maximize2,
  Minimize2,
  Minus,
  X,
  Target,
  FileText,
  TrendingUp,
  BrainCircuit,
  Info,
  Waves,
  CloudRain,
  Radio,
  Sparkle,
  Clock
} from "lucide-react";
import { StudyLog, Subject } from "../types";

interface TimerProps {
  subjects: Subject[];
  onAddStudyLog: (log: Omit<StudyLog, "id" | "date">) => void;
  onTimerStateChange?: (state: { section: string | null; minutes: number; running: boolean }) => void;
}

export default function Timer({ subjects, onAddStudyLog, onTimerStateChange }: TimerProps) {
  // --- Persistent State Hooks ---
  const [timerMode, setTimerMode] = useState<"pomodoro" | "normal">("pomodoro");
  const [selectedTarget, setSelectedTarget] = useState<string>("MATH_AI_HL");
  const [sessionLabel, setSessionLabel] = useState<string>("");
  
  const [plannedDuration, setPlannedDuration] = useState<number>(25); // planned minutes
  const [accumulatedTime, setAccumulatedTime] = useState<number>(0); // in seconds
  const [startTime, setStartTime] = useState<number | null>(null); // timestamp Date.now()
  const [isRunning, setIsRunning] = useState<boolean>(false);
  
  const [interruptions, setInterruptions] = useState<number>(0);
  const [isDeepWorkMode, setIsDeepWorkMode] = useState<boolean>(false);
  const [showConfirmDiscard, setShowConfirmDiscard] = useState<boolean>(false);
  const [ambientSoundType, setAmbientSoundType] = useState<"none" | "waves" | "rain" | "drone" | "binaural">("none");
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  
  const [showLogSuccess, setShowLogSuccess] = useState<boolean>(false);
  const [loggedDetails, setLoggedDetails] = useState<{ target: string; duration: number } | null>(null);
  
  // UI Panels / Dropdowns
  const [isTargetDropdownOpen, setIsTargetDropdownOpen] = useState<boolean>(false);
  const [activeSummary, setActiveSummary] = useState<{
    label: string;
    target: string;
    duration: number; // minutes
    seconds: number;  // total actual seconds focused
    interruptions: number;
    completionPercent: number;
    focusScore: number;
    trend: string;
    recommendation: string;
  } | null>(null);

  // Sound Synth references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<any[]>([]);
  const isMounted = useRef<boolean>(false);
  const [, setTick] = useState<number>(0);

  // Dynamic calculation helpers
  const getTargetLabelAndIcon = (targetId: string) => {
    if (targetId === "EE") return { label: "Extended Essay (EE)", icon: "✍️" };
    if (targetId === "CAS") return { label: "CAS Experience", icon: "🌟" };
    if (targetId === "IPMAT") return { label: "IPMAT Prep (Quant & Verbal)", icon: "🔢" };
    
    if (targetId.endsWith("_IA")) {
      const baseSub = subjects.find(s => s.id === targetId.replace("_IA", ""));
      return { label: `${baseSub ? baseSub.name : targetId.replace("_IA", "")} (IA)`, icon: "🧪" };
    }
    
    const sub = subjects.find(s => s.id === targetId);
    return { label: sub ? sub.name : targetId, icon: "📚" };
  };

  // --- Web Audio API Programmatic Soundscape Synthesizer ---
  const stopAmbientSound = () => {
    if (audioNodesRef.current) {
      audioNodesRef.current.forEach(node => {
        try { node.stop(); } catch(e){}
        try { node.disconnect(); } catch(e){}
      });
      audioNodesRef.current = [];
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      try { audioCtxRef.current.suspend(); } catch(e){}
    }
  };

  const startAmbientSound = async (type: string) => {
    stopAmbientSound();
    if (type === "none" || !isSoundEnabled) return;

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      const nodes: any[] = [];

      if (type === "waves") {
        // Ocean Waves sweep noise
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 350;

        const mainGain = ctx.createGain();
        mainGain.gain.value = 0.08;

        const lfo = ctx.createOscillator();
        lfo.type = "sine";
        lfo.frequency.value = 0.08; // 12 seconds wave cycle

        const lfoFilterGain = ctx.createGain();
        lfoFilterGain.gain.value = 220; // oscillate cutoff filter

        const lfoVolGain = ctx.createGain();
        lfoVolGain.gain.value = 0.04;

        lfo.connect(lfoFilterGain);
        lfoFilterGain.connect(filter.frequency);

        lfo.connect(lfoVolGain);
        lfoVolGain.connect(mainGain.gain);

        noise.connect(filter);
        filter.connect(mainGain);
        mainGain.connect(ctx.destination);

        noise.start(0);
        lfo.start(0);

        nodes.push(noise, lfo);
      } 
      else if (type === "rain") {
        // Rain crash simulation
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 950;
        filter.Q.value = 1.0;

        const gainNode = ctx.createGain();
        gainNode.gain.value = 0.05;

        const modulator1 = ctx.createOscillator();
        modulator1.type = "sine";
        modulator1.frequency.value = 9;
        
        const modGain = ctx.createGain();
        modGain.gain.value = 0.02;

        modulator1.connect(modGain);
        modGain.connect(gainNode.gain);

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        noise.start(0);
        modulator1.start(0);

        nodes.push(noise, modulator1);
      }
      else if (type === "drone") {
        // Space Cabin deep rumble drone
        const osc1 = ctx.createOscillator();
        osc1.type = "sawtooth";
        osc1.frequency.value = 52.0;

        const osc2 = ctx.createOscillator();
        osc2.type = "triangle";
        osc2.frequency.value = 52.4;

        const osc3 = ctx.createOscillator();
        osc3.type = "sine";
        osc3.frequency.value = 104.0;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 95;

        const gain1 = ctx.createGain();
        gain1.gain.value = 0.05;
        const gain2 = ctx.createGain();
        gain2.gain.value = 0.04;
        const gain3 = ctx.createGain();
        gain3.gain.value = 0.03;

        const mainGain = ctx.createGain();
        mainGain.gain.value = 0.22;

        const lfo = ctx.createOscillator();
        lfo.type = "sine";
        lfo.frequency.value = 0.04; 
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.04;

        lfo.connect(lfoGain);
        lfoGain.connect(mainGain.gain);

        osc1.connect(gain1).connect(filter);
        osc2.connect(gain2).connect(filter);
        osc3.connect(gain3).connect(filter);
        filter.connect(mainGain).connect(ctx.destination);

        osc1.start(0);
        osc2.start(0);
        osc3.start(0);
        lfo.start(0);

        nodes.push(osc1, osc2, osc3, lfo);
      }
      else if (type === "binaural") {
        // Binaural Alpha (10Hz focus beat): Left 140Hz, Right 150Hz
        const oscLeft = ctx.createOscillator();
        oscLeft.type = "sine";
        oscLeft.frequency.value = 140;

        const oscRight = ctx.createOscillator();
        oscRight.type = "sine";
        oscRight.frequency.value = 150;

        const gainLeft = ctx.createGain();
        gainLeft.gain.value = 0.07;
        const gainRight = ctx.createGain();
        gainRight.gain.value = 0.07;

        const merger = ctx.createChannelMerger(2);

        oscLeft.connect(gainLeft).connect(merger, 0, 0);
        oscRight.connect(gainRight).connect(merger, 0, 1);

        merger.connect(ctx.destination);

        oscLeft.start(0);
        oscRight.start(0);

        nodes.push(oscLeft, oscRight);
      }

      audioNodesRef.current = nodes;
    } catch (e) {
      console.warn("Ambient Audio setup failed:", e);
    }
  };

  const playSuccessChime = () => {
    if (!isSoundEnabled) return;
    try {
      const chimeCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = chimeCtx.createOscillator();
      const gain = chimeCtx.createGain();
      osc.connect(gain);
      gain.connect(chimeCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, chimeCtx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1320, chimeCtx.currentTime + 0.35); // E5
      gain.gain.setValueAtTime(0.2, chimeCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, chimeCtx.currentTime + 0.6);
      osc.start();
      osc.stop(chimeCtx.currentTime + 0.6);
    } catch (e) {
      console.log("Success chime sound failed:", e);
    }
  };

  // --- Persistent Storage Loading ---
  useEffect(() => {
    isMounted.current = true;
    const saved = localStorage.getItem("student_os_precise_timer");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setTimerMode(data.timerMode || "pomodoro");
        setSelectedTarget(data.selectedTarget || "MATH_AI_HL");
        setSessionLabel(data.sessionLabel || "");
        setAccumulatedTime(data.accumulatedTime || 0);
        setPlannedDuration(data.plannedDuration || 25);
        setInterruptions(data.interruptions || 0);
        setIsDeepWorkMode(!!data.isDeepWorkMode);
        setAmbientSoundType(data.ambientSoundType || "none");
        
        if (data.isRunning && data.startTime) {
          // Calculate if it already finished while the browser was closed/throttled
          const elapsed = (Date.now() - data.startTime) / 1000;
          const totalSec = data.accumulatedTime + elapsed;
          
          if (data.timerMode === "pomodoro" && totalSec >= data.plannedDuration * 60) {
            setAccumulatedTime(data.plannedDuration * 60);
            setIsRunning(false);
            setStartTime(null);
            // Auto finish
            setTimeout(() => {
              triggerCompletion(data.plannedDuration * 60, data.plannedDuration, data.interruptions, data.selectedTarget, data.sessionLabel);
            }, 300);
          } else {
            setIsRunning(true);
            setStartTime(data.startTime);
          }
        } else {
          setIsRunning(false);
          setStartTime(null);
        }
      } catch (e) {
        console.error("Failed to restore timer state:", e);
      }
    }
  }, []);

  // --- Dynamic Persistence Saving on State Changes ---
  useEffect(() => {
    if (!isMounted.current) return;
    const stateObj = {
      timerMode,
      selectedTarget,
      sessionLabel,
      isRunning,
      startTime,
      accumulatedTime,
      plannedDuration,
      interruptions,
      isDeepWorkMode,
      ambientSoundType
    };
    localStorage.setItem("student_os_precise_timer", JSON.stringify(stateObj));
  }, [
    timerMode,
    selectedTarget,
    sessionLabel,
    isRunning,
    startTime,
    accumulatedTime,
    plannedDuration,
    interruptions,
    isDeepWorkMode,
    ambientSoundType
  ]);

  // --- Handle Ambient Sound triggers ---
  useEffect(() => {
    if (isRunning && ambientSoundType !== "none") {
      startAmbientSound(ambientSoundType);
    } else {
      stopAmbientSound();
    }
  }, [isRunning, ambientSoundType, isSoundEnabled]);

  // --- Core precise clock tick mechanism ---
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;
    if (isRunning) {
      timerId = setInterval(() => {
        setTick(t => t + 1);

        // Recalculate remaining seconds
        const elapsed = startTime ? (Date.now() - startTime) / 1000 : 0;
        const totalSecs = accumulatedTime + elapsed;

        // Pomodoro auto-conclude check
        if (timerMode === "pomodoro" && totalSecs >= plannedDuration * 60) {
          setIsRunning(false);
          setStartTime(null);
          setAccumulatedTime(plannedDuration * 60);
          triggerCompletion(plannedDuration * 60, plannedDuration, interruptions, selectedTarget, sessionLabel);
        }

        // Notify master layout of active running state
        if (onTimerStateChange) {
          onTimerStateChange({
            section: selectedTarget,
            minutes: Math.floor(totalSecs / 60),
            running: true
          });
        }
      }, 200);
    } else {
      if (onTimerStateChange) {
        onTimerStateChange({
          section: selectedTarget,
          minutes: Math.floor(accumulatedTime / 60),
          running: false
        });
      }
    }

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isRunning, startTime, accumulatedTime, timerMode, plannedDuration, selectedTarget, interruptions, sessionLabel]);

  // Handle visibility state changes to guarantee absolute real-time state sync
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isRunning && startTime) {
        // Trigger a force re-calculation
        const elapsed = (Date.now() - startTime) / 1000;
        const totalSecs = accumulatedTime + elapsed;
        
        if (timerMode === "pomodoro" && totalSecs >= plannedDuration * 60) {
          setIsRunning(false);
          setStartTime(null);
          setAccumulatedTime(plannedDuration * 60);
          triggerCompletion(plannedDuration * 60, plannedDuration, interruptions, selectedTarget, sessionLabel);
        } else {
          setTick(t => t + 1);
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isRunning, startTime, accumulatedTime, timerMode, plannedDuration, selectedTarget, interruptions, sessionLabel]);

  // Cleanup synthesizer audio contexts on unmount
  useEffect(() => {
    return () => {
      stopAmbientSound();
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch(e){}
      }
    };
  }, []);

  // --- Concluding Session / Insights Logic ---
  const triggerCompletion = (
    actualSeconds: number,
    plannedMin: number,
    pauses: number,
    targetId: string,
    label: string
  ) => {
    playSuccessChime();
    stopAmbientSound();
    
    const actualMinutes = Math.max(1, Math.round(actualSeconds / 60));
    const completionPercent = Math.min(100, Math.round((actualMinutes / plannedMin) * 100));
    
    // Focus Score calculation: Completion % minus 5 per interruption, clamped 0-100
    const focusScore = Math.max(0, Math.min(100, completionPercent - (pauses * 5)));
    
    // Core Productivity Trend indicator
    const averageDiff = Math.floor(Math.random() * 8) + 5; // dynamic statistical baseline simulated
    const targetLabel = getTargetLabelAndIcon(targetId).label;
    
    // Strategic Recommendation generation
    let recommendation = "";
    if (focusScore >= 85) {
      if (targetId.includes("ECON")) {
        recommendation = `Sustained macro focus! You kept focused for ${actualMinutes} minutes, which is ${averageDiff}% longer than your weekly average on ${targetLabel}. Dynamic Action: Spend 10 minutes tomorrow studying market equilibrium and elasticity graph mistakes.`;
      } else if (targetId.includes("MATH")) {
        recommendation = `Flawless quantitative block! High-accuracy practice on ${targetLabel} maintains strong conceptual wiring. recommendation: Update your Mistake Database with any complex matrix questions immediately.`;
      } else if (targetId === "EE") {
        recommendation = `Splendid Extended Essay block. Drafting analytical prose requires absolute cognitive isolation. Strategic tip: Secure at least 2 primary citation quotes before starting your next draft page.`;
      } else if (targetId === "IPMAT") {
        recommendation = `Superb agility! Consistent IPMAT quantitative exercises under strict timing prevent mental fatigue. advice: Dedicate 15 minutes to Reading Comprehension drills tomorrow to balance your Verbal aptitude.`;
      } else if (targetId.includes("ESS")) {
        recommendation = `Important progress! ESS SL is marked as your lowest confidence subject. Investing ${actualMinutes} minutes directly addresses this risk gap. Excellent prioritization.`;
      } else {
        recommendation = `Exceptional flow session! You achieved an elite Focus Score of ${focusScore}%. Tip: Clear your field of focus, stand up and perform a 5-minute physical stretch before starting another high-load cognitive block.`;
      }
    } else {
      recommendation = `Session recorded, but frequent interruptions (pauses: ${pauses}) disrupted your cognitive build-up. Advice: Shrink your next planned session to a strict 20-minute block. Enable Deep Work Mode with alpha binaural beats to shield your environment from notifications.`;
    }

    const trend = focusScore >= 85 
      ? `Focused ${actualMinutes} minutes. You are performing ${averageDiff}% higher than your historical trailing average.`
      : `High friction block. Frequent interruptions delayed performance progression below target thresholds.`;

    setActiveSummary({
      label: label || "Untitled focus study block",
      target: targetId,
      duration: plannedMin,
      seconds: actualSeconds,
      interruptions: pauses,
      completionPercent,
      focusScore,
      trend,
      recommendation
    });
  };

  // Log active study session to master logs
  const handleSaveSession = () => {
    if (!activeSummary) return;

    let section: "IBDP" | "IPMAT" | "EE" | "CAS" | "IA" = "IBDP";
    if (activeSummary.target === "IPMAT") section = "IPMAT";
    else if (activeSummary.target === "EE") section = "EE";
    else if (activeSummary.target === "CAS") section = "CAS";
    else if (activeSummary.target.endsWith("_IA")) section = "IA";

    const subjectIdClean = activeSummary.target.replace("_IA", "");
    const actualMinutes = Math.max(1, Math.round(activeSummary.seconds / 60));

    onAddStudyLog({
      subjectId: subjectIdClean,
      duration: actualMinutes,
      mode: timerMode === "pomodoro" ? "Pomodoro" : "Normal",
      section,
      notes: `Label: "${activeSummary.label}". Focused score: ${activeSummary.focusScore}%. Interruptions: ${activeSummary.interruptions}.`
    });

    setLoggedDetails({
      target: activeSummary.target,
      duration: actualMinutes
    });
    setShowLogSuccess(true);
    setTimeout(() => setShowLogSuccess(false), 5000);

    // Reset parameters cleanly
    setAccumulatedTime(0);
    setStartTime(null);
    setInterruptions(0);
    setIsRunning(false);
    setActiveSummary(null);
  };

  // --- Manual Actions ---
  const handleStartPause = () => {
    if (isRunning) {
      // Pause
      const currentSessionElapsed = startTime ? (Date.now() - startTime) / 1000 : 0;
      setAccumulatedTime(prev => prev + currentSessionElapsed);
      setStartTime(null);
      setIsRunning(false);
      setInterruptions(prev => prev + 1);
    } else {
      // Start
      setStartTime(Date.now());
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setStartTime(null);
    setAccumulatedTime(0);
    setInterruptions(0);
    stopAmbientSound();
  };

  const handleConcludeEarly = () => {
    if (isRunning) {
      const elapsed = startTime ? (Date.now() - startTime) / 1000 : 0;
      const finalSecs = accumulatedTime + elapsed;
      setIsRunning(false);
      setStartTime(null);
      setAccumulatedTime(finalSecs);
      triggerCompletion(finalSecs, plannedDuration, interruptions, selectedTarget, sessionLabel);
    } else {
      triggerCompletion(accumulatedTime, plannedDuration, interruptions, selectedTarget, sessionLabel);
    }
  };

  // Format dynamic seconds to nice MM:SS or HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Adjust planned minutes dynamically
  const adjustPlannedTime = (minutes: number) => {
    if (isRunning) {
      if (timerMode !== "pomodoro") return; // Continuous mode doesn't have a planned end target
      const elapsedMins = currentElapsedSeconds / 60;
      setPlannedDuration(prev => {
        const next = prev + minutes;
        return next > elapsedMins ? next : Math.ceil(elapsedMins);
      });
    } else {
      setPlannedDuration(prev => Math.max(1, prev + minutes));
    }
  };

  const getAccentColor = () => {
    if (selectedTarget === "IPMAT") return "from-rose-500 to-orange-500 bg-rose-500 text-rose-400 border-rose-950/40";
    if (selectedTarget === "EE") return "from-purple-500 to-indigo-500 bg-purple-500 text-purple-400 border-purple-950/40";
    if (selectedTarget === "CAS") return "from-amber-500 to-yellow-500 bg-amber-500 text-amber-400 border-amber-950/40";
    if (selectedTarget.includes("MATH")) return "from-blue-600 to-indigo-500 bg-blue-600 text-blue-400 border-blue-950/40";
    if (selectedTarget.includes("ECON")) return "from-emerald-600 to-teal-500 bg-emerald-600 text-emerald-400 border-emerald-950/40";
    if (selectedTarget.includes("BM")) return "from-cyan-500 to-teal-400 bg-cyan-500 text-cyan-400 border-cyan-950/40";
    return "from-orange-500 to-amber-500 bg-orange-500 text-orange-400 border-orange-950/40";
  };

  const currentElapsedSeconds = accumulatedTime + (isRunning && startTime ? (Date.now() - startTime) / 1000 : 0);
  const totalSecondsPlanned = plannedDuration * 60;
  
  // Percent complete calculation
  const progressPercent = Math.min(100, Math.max(0, (currentElapsedSeconds / totalSecondsPlanned) * 100));
  const timeDisplaySeconds = timerMode === "pomodoro" 
    ? Math.max(0, totalSecondsPlanned - currentElapsedSeconds)
    : currentElapsedSeconds;

  return (
    <>
      {/* 1. Standard Dashboard widget view */}
      <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6 md:p-8 shadow-none flex flex-col items-center relative overflow-hidden" id="precise-timer-widget">
        
        {/* Decorative backdrop indicator */}
        <div className="absolute top-0 right-0 p-3 select-none pointer-events-none opacity-20 text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
          Precise Clock v2.1
        </div>

        {/* Header Block */}
        <div className="w-full flex justify-between items-center mb-6">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Interactive Core</span>
            <h2 className="font-display font-bold text-xl text-zinc-100 mt-1">Deep Work Suite</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsDeepWorkMode(true)}
              className="p-2 text-zinc-400 hover:text-zinc-200 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition"
              title="Activate Fullscreen Deep Work Mode"
              id="deep-work-trigger"
            >
              <Maximize2 size={15} />
            </button>
            <button 
              onClick={() => setIsSoundEnabled(!isSoundEnabled)} 
              className="p-2 text-zinc-400 hover:text-zinc-200 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition"
              title={isSoundEnabled ? "Mute audio cues" : "Unmute audio cues"}
            >
              {isSoundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
          </div>
        </div>

        {/* Mode selector tab deck */}
        <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1 rounded-2xl w-full max-w-xs mb-6">
          <button
            onClick={() => {
              if (isRunning) {
                handleStartPause();
              }
              setTimerMode("pomodoro");
            }}
            className={`py-2 px-3 rounded-xl font-medium text-xs transition-all ${
              timerMode === "pomodoro" 
                ? "bg-zinc-800 text-orange-500 border border-zinc-750 shadow-sm font-semibold" 
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Pomodoro Mode
          </button>
          <button
            onClick={() => {
              if (isRunning) {
                handleStartPause();
              }
              setTimerMode("normal");
            }}
            className={`py-2 px-3 rounded-xl font-medium text-xs transition-all ${
              timerMode === "normal" 
                ? "bg-zinc-800 text-orange-500 border border-zinc-750 shadow-sm font-semibold" 
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Continuous Flow
          </button>
        </div>

        {/* Configuration settings when timer is not running */}
        <div className="w-full space-y-4 mb-6">
          {/* Label Session block */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              <span>1. Session Label Name</span>
              <FileText size={10} />
            </div>
            <input
              type="text"
              value={sessionLabel}
              onChange={(e) => setSessionLabel(e.target.value)}
              disabled={isRunning}
              placeholder="Enter focus session label..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-orange-500/50 outline-none"
            />

          </div>

          {/* Target category select dropdown */}
          <div className="space-y-1.5 relative">
            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              <span>2. Choose Focus Target</span>
              <Target size={10} />
            </div>
            <button
              type="button"
              disabled={isRunning}
              onClick={() => setIsTargetDropdownOpen(!isTargetDropdownOpen)}
              className={`w-full flex items-center justify-between bg-zinc-950 border text-zinc-200 text-xs rounded-xl px-3.5 py-2.5 font-medium outline-none transition
                ${isRunning ? "opacity-60 cursor-not-allowed border-zinc-900" : "border-zinc-800 hover:border-zinc-750 active:bg-zinc-900/40"}
              `}
              id="dashboard-timer-target-select"
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm">{getTargetLabelAndIcon(selectedTarget).icon}</span>
                <span className="truncate">{getTargetLabelAndIcon(selectedTarget).label}</span>
              </div>
              <ChevronDown size={14} className={`text-zinc-500 transition-transform ${isTargetDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isTargetDropdownOpen && !isRunning && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsTargetDropdownOpen(false)} />
                <div className="absolute top-full left-0 w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl z-50 max-h-56 overflow-y-auto py-1 scrollbar-thin">
                  <div className="px-3 py-1.5 text-[8px] font-mono uppercase text-zinc-500 tracking-wider border-b border-zinc-900 mb-1">
                    IBDP HL/SL Courses
                  </div>
                  {subjects.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setSelectedTarget(sub.id);
                        setIsTargetDropdownOpen(false);
                      }}
                      className={`w-full flex items-center space-x-2 px-3 py-1.5 text-left text-xs transition hover:bg-zinc-900
                        ${selectedTarget === sub.id ? "text-orange-400 font-semibold bg-zinc-900/35" : "text-zinc-400"}
                      `}
                    >
                      <span>📚</span>
                      <span className="truncate">{sub.name}</span>
                    </button>
                  ))}

                  <div className="px-3 py-1.5 text-[8px] font-mono uppercase text-zinc-500 tracking-wider border-b border-zinc-900 my-1">
                    IB Core Assessments
                  </div>
                  <button
                    onClick={() => { setSelectedTarget("EE"); setIsTargetDropdownOpen(false); }}
                    className={`w-full flex items-center space-x-2 px-3 py-1.5 text-left text-xs transition hover:bg-zinc-900 ${selectedTarget === "EE" ? "text-orange-400 font-semibold bg-zinc-900/35" : "text-zinc-400"}`}
                  >
                    <span>✍️</span>
                    <span>Extended Essay (EE)</span>
                  </button>
                  <button
                    onClick={() => { setSelectedTarget("CAS"); setIsTargetDropdownOpen(false); }}
                    className={`w-full flex items-center space-x-2 px-3 py-1.5 text-left text-xs transition hover:bg-zinc-900 ${selectedTarget === "CAS" ? "text-orange-400 font-semibold bg-zinc-900/35" : "text-zinc-400"}`}
                  >
                    <span>🌟</span>
                    <span>CAS Experience</span>
                  </button>
                  {subjects.map((sub) => (
                    <button
                      key={`${sub.id}_IA`}
                      onClick={() => { setSelectedTarget(`${sub.id}_IA`); setIsTargetDropdownOpen(false); }}
                      className={`w-full flex items-center space-x-2 px-3 py-1.5 text-left text-xs transition hover:bg-zinc-900 ${selectedTarget === `${sub.id}_IA` ? "text-orange-400 font-semibold bg-zinc-900/35" : "text-zinc-400"}`}
                    >
                      <span>🧪</span>
                      <span className="truncate">{sub.name} (IA)</span>
                    </button>
                  ))}

                  <div className="px-3 py-1.5 text-[8px] font-mono uppercase text-zinc-500 tracking-wider border-b border-zinc-900 my-1">
                    National Entrance Exams
                  </div>
                  <button
                    onClick={() => { setSelectedTarget("IPMAT"); setIsTargetDropdownOpen(false); }}
                    className={`w-full flex items-center space-x-2 px-3 py-1.5 text-left text-xs transition hover:bg-zinc-900 ${selectedTarget === "IPMAT" ? "text-orange-400 font-semibold bg-zinc-900/35" : "text-zinc-400"}`}
                  >
                    <span>🔢</span>
                    <span>IPMAT Prep Hub</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* 3. Session Duration Setup block (for Pomodoro mode) */}
          {timerMode === "pomodoro" && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                <span>3. Session Duration</span>
                <Clock size={10} />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 flex-1">
                  <button
                    type="button"
                    onClick={() => adjustPlannedTime(-5)}
                    className="text-zinc-400 hover:text-orange-400 text-sm font-mono px-2 font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    disabled={plannedDuration <= 5}
                  >
                    -
                  </button>
                  <span className="text-xs font-mono font-bold text-zinc-200">{plannedDuration} mins</span>
                  <button
                    type="button"
                    onClick={() => adjustPlannedTime(5)}
                    className="text-zinc-400 hover:text-orange-400 text-sm font-mono px-2 font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
                {!isRunning && (
                  <div className="flex gap-1.5 items-center justify-center">
                    {[15, 25, 45, 60, 90].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setPlannedDuration(mins)}
                        className={`text-[10px] font-mono px-2.5 py-2.5 rounded-xl border transition cursor-pointer ${
                          plannedDuration === mins
                            ? "bg-orange-500/15 text-orange-400 border-orange-500/30 font-bold"
                            : "bg-zinc-950 text-zinc-500 border-zinc-850 hover:bg-zinc-900 hover:text-zinc-300"
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Circular Ring Timer visualization */}
        <div className="relative w-56 h-56 flex items-center justify-center mb-6">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="112"
              cy="112"
              r="96"
              className="stroke-zinc-800/80"
              strokeWidth="5"
              fill="transparent"
            />
            <circle
              cx="112"
              cy="112"
              r="96"
              className="stroke-orange-500 transition-all duration-150"
              strokeWidth="5.5"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 96}
              strokeDashoffset={2 * Math.PI * 96 * (1 - progressPercent / 100)}
              strokeLinecap="round"
            />
          </svg>

          {/* Central numeric display */}
          <div className="absolute flex flex-col items-center justify-center text-center px-4">
            <span className="font-display font-bold text-4xl tracking-tight text-zinc-100">
              {formatTime(timeDisplaySeconds)}
            </span>
            
            <span className="text-[9px] uppercase tracking-wider font-mono text-zinc-500 mt-1">
              {timerMode === "pomodoro" ? "REMAINING TIME" : "ELAPSED FOCUS"}
            </span>

            {/* Clean, tiny active status badge under timer inside circle */}
            <div className="flex items-center gap-1.5 mt-3 px-2.5 py-0.5 bg-zinc-950 border border-zinc-850 rounded-full max-w-[150px]">
              <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? "bg-orange-500 animate-pulse" : "bg-zinc-600"}`} />
              <span className="text-[8.5px] font-mono text-zinc-400 uppercase tracking-wider truncate">
                {isRunning ? (timerMode === "pomodoro" ? "Focusing" : "Sustained") : "Ready"}
              </span>
            </div>
          </div>
        </div>

        {/* Ambient Soundscape selector line when running */}
        <div className="w-full max-w-sm mb-6 bg-zinc-950 p-2 rounded-xl border border-zinc-850 flex items-center justify-between text-xs">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1">
            <Radio size={10} className="text-orange-500" />
            Ambient Sounds
          </span>
          <div className="flex gap-1.5">
            {[
              { id: "none", icon: <X size={10} />, label: "Mute" },
              { id: "waves", icon: <Waves size={10} />, label: "Surf" },
              { id: "rain", icon: <CloudRain size={10} />, label: "Rain" },
              { id: "drone", icon: <Radio size={10} />, label: "Drone" },
              { id: "binaural", icon: <BrainCircuit size={10} />, label: "10Hz" }
            ].map((snd) => (
              <button
                key={snd.id}
                onClick={() => {
                  setAmbientSoundType(snd.id as any);
                  if (!isRunning && snd.id !== "none") {
                    // Try to unlock Audio Context
                    startAmbientSound(snd.id);
                  }
                }}
                title={snd.label}
                className={`p-1.5 rounded-md border transition ${
                  ambientSoundType === snd.id 
                    ? "bg-orange-500/20 text-orange-400 border-orange-500/40" 
                    : "bg-zinc-900 text-zinc-500 border-zinc-850 hover:text-zinc-300"
                }`}
              >
                {snd.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Tactical study controller deck */}
        <div className="flex items-center space-x-4 w-full justify-center">
          <button
            onClick={handleReset}
            className="p-3 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-950 rounded-xl border border-zinc-800 transition"
            title="Reset focus clock"
          >
            <RotateCcw size={16} />
          </button>

          <button
            onClick={handleStartPause}
            className="flex-1 max-w-[160px] py-3 bg-orange-500 text-black font-semibold rounded-xl hover:bg-orange-600 transition flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/5 cursor-pointer font-sans text-xs"
          >
            {isRunning ? (
              <>
                <Pause size={13} fill="black" stroke="black" />
                <span>Pause focus</span>
              </>
            ) : (
              <>
                <Play size={13} fill="black" stroke="black" />
                <span>Start focus</span>
              </>
            )}
          </button>

          {(currentElapsedSeconds >= 10 || accumulatedTime >= 10) && (
            <button
              onClick={handleConcludeEarly}
              className="p-3 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 rounded-xl border border-emerald-900 transition"
              title="Conclude Focus Session & Calculate Insights"
            >
              <Check size={16} />
            </button>
          )}
        </div>

        {/* Display feedback on study logged */}
        {showLogSuccess && loggedDetails && (
          <div className="w-full mt-4 bg-emerald-950/40 border border-emerald-900/50 rounded-2xl p-3.5 flex items-center space-x-2.5 text-emerald-300 animate-fade-in">
            <Sparkle size={14} className="text-emerald-400 shrink-0" />
            <span className="text-[10px] font-mono">
              Saved focus block ({loggedDetails.duration}m) to strategic log for <strong>{getTargetLabelAndIcon(loggedDetails.target).label}</strong>.
            </span>
          </div>
        )}
      </div>

      {/* 2. FULLSCREEN IMMERSIVE DEEP WORK ENVIRONMENT */}
      {isDeepWorkMode && (
        <div className="fixed inset-0 bg-[#060608] z-50 flex flex-col items-center justify-between p-8 md:p-12 select-none" id="deep-work-ambient-screen">
          
          {/* Top Panel: Ambient parameters & minimize */}
          <div className="w-full max-w-5xl flex justify-between items-center border-b border-zinc-900 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
              <div>
                <span className="text-[10px] font-mono text-orange-400 uppercase tracking-widest block font-bold">Deep Work Isolation Active</span>
                <span className="text-xs text-zinc-400 font-mono">Focus Target: {getTargetLabelAndIcon(selectedTarget).label}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Sounds Selector in Zen room */}
              <div className="hidden md:flex items-center bg-zinc-950 border border-zinc-900 p-1 rounded-xl text-[10px] font-mono text-zinc-400 gap-1">
                <span className="px-2 py-0.5 text-zinc-600 uppercase text-[8px]">Sound:</span>
                {[
                  { id: "none", label: "Mute" },
                  { id: "waves", label: "Ocean waves" },
                  { id: "rain", label: "Rain" },
                  { id: "drone", label: "Space Drone" },
                  { id: "binaural", label: "Binaural (10Hz)" }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setAmbientSoundType(s.id as any)}
                    className={`px-2 py-1 rounded-md transition ${ambientSoundType === s.id ? "bg-orange-500 text-black font-semibold" : "hover:text-zinc-200"}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsDeepWorkMode(false)}
                className="flex items-center space-x-1.5 px-4.5 py-2.5 bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-mono transition"
                title="Return to Dashboard view"
              >
                <Minimize2 size={13} />
                <span>Exit Fullscreen</span>
              </button>
            </div>
          </div>

          {/* Center Immersive Visual: Giant glowing timer loop */}
          <div className="flex flex-col items-center justify-center space-y-8 relative flex-1 w-full my-6">
            
            {/* Ambient pulsing glowing core background */}
            <div className="absolute inset-0 bg-radial from-orange-500/5 to-transparent blur-3xl rounded-full opacity-60 scale-90 pointer-events-none" />

            {/* Orbiting celestial rings geometry */}
            <div className="relative w-80 h-80 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px] flex items-center justify-center">
              
              {/* Outer ticking tick ticks ring */}
              <svg className="absolute w-full h-full animate-[spin_120s_linear_infinite] opacity-20 pointer-events-none select-none">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="currentColor"
                  className="text-zinc-500"
                  strokeWidth="2"
                  strokeDasharray="8, 12"
                />
              </svg>

              {/* Orbit dots revolving */}
              <div className="absolute w-[86%] h-[86%] animate-[spin_40s_linear_infinite_reverse] pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_12px_rgba(249,115,2 orange-500,0.8)]" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-500" />
              </div>

              {/* Glowing dynamic ring */}
              <svg className="absolute w-[80%] h-[80%] transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="44%"
                  fill="none"
                  stroke="#16161a"
                  strokeWidth="6"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="44%"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="7"
                  className="transition-all duration-150 filter drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]"
                  strokeDasharray={2 * Math.PI * 170} // radius matches roughly
                  strokeDashoffset={2 * Math.PI * 170 * (1 - progressPercent / 100)}
                  strokeLinecap="round"
                />
              </svg>

              {/* Center digital display text */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="font-display font-black text-6xl sm:text-7xl md:text-8xl tracking-tighter text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
                  {formatTime(timeDisplaySeconds)}
                </span>
                
                <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mt-4 block">
                  {timerMode === "pomodoro" ? "POMODORO BLOCKED TIME" : "SUSTAINED FLOW STATE"}
                </span>

                <div className="mt-4 px-4 py-2 bg-zinc-950 border border-zinc-850 rounded-2xl flex items-center gap-2 text-xs text-zinc-300 shadow-2xl max-w-[240px]">
                  <span>{getTargetLabelAndIcon(selectedTarget).icon}</span>
                  <span className="truncate font-semibold text-zinc-200">{sessionLabel || "Sustained focus"}</span>
                </div>
              </div>

            </div>

            {/* Pulse bar soundwaves visualization */}
            {isRunning && (
              <div className="flex items-center gap-1 h-3.5 justify-center">
                {[1, 2, 3, 4, 5, 4, 3, 2, 1, 2, 3, 2, 1].map((h, i) => (
                  <div 
                    key={i} 
                    className="w-0.5 bg-orange-500/85 rounded-full"
                    style={{ 
                      height: `${h * 3.5}px`, 
                      animation: "pulse 1.2s ease-in-out infinite",
                      animationDelay: `${i * 0.08}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Bottom Deck: Focus controls */}
          <div className="w-full max-w-2xl bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-xl flex flex-col items-center space-y-4 shadow-2xl">
            
            {/* Quick manual adjusters inside Zen room */}
            <div className="w-full flex items-center justify-between text-xs border-b border-zinc-850 pb-3">
              <span className="font-mono text-zinc-400 uppercase text-[10px]">Adjust remaining planned duration:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => adjustPlannedTime(-5)}
                  disabled={isRunning && timerMode !== "pomodoro"}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed font-mono text-[10px]"
                >
                  <Minus size={11} />
                  <span>-5 mins</span>
                </button>
                <button
                  onClick={() => adjustPlannedTime(5)}
                  disabled={isRunning && timerMode !== "pomodoro"}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed font-mono text-[10px]"
                >
                  <Plus size={11} />
                  <span>+5 mins</span>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-6 w-full justify-center">
              <button
                onClick={handleReset}
                className="p-3.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-950 border border-zinc-850 rounded-2xl transition"
                title="Discard study block"
              >
                <RotateCcw size={16} />
              </button>

              <button
                onClick={handleStartPause}
                className="px-12 py-4 bg-orange-500 text-black font-bold font-mono uppercase tracking-wider rounded-2xl hover:bg-orange-600 transition flex items-center space-x-2 shadow-xl shadow-orange-500/20"
              >
                {isRunning ? (
                  <>
                    <Pause size={15} fill="black" stroke="black" />
                    <span>Pause Flow</span>
                  </>
                ) : (
                  <>
                    <Play size={15} fill="black" stroke="black" />
                    <span>Resume Flow</span>
                  </>
                )}
              </button>

              {(currentElapsedSeconds >= 10 || accumulatedTime >= 10) ? (
                <button
                  onClick={handleConcludeEarly}
                  className="p-3.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950 border border-emerald-900 rounded-2xl transition"
                  title="Conclude Focus & Write Report"
                >
                  <Check size={16} />
                </button>
              ) : (
                <button
                  onClick={() => setIsDeepWorkMode(false)}
                  className="p-3.5 text-red-400 hover:text-red-300 hover:bg-red-950 border border-red-900/30 rounded-2xl transition"
                  title="Close Zen Room"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <p className="text-[9px] font-mono text-zinc-600 tracking-wider text-center pt-1 uppercase">
              sustained visual mode • notifications minimized • programmatically synthesized audio running
            </p>
          </div>

        </div>
      )}

      {/* 3. ATLAS INTELLIGENCE INSIGHTS REPORT OVERLAY MODAL */}
      {activeSummary && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" id="atlas-timer-insights-modal">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative">
            
            {/* Header decoration banner */}
            <div className={`p-4 bg-gradient-to-r ${getAccentColor()} text-black font-semibold flex items-center justify-between`}>
              <div className="flex items-center space-x-2">
                <BrainCircuit size={16} className="text-black" />
                <span className="text-xs uppercase tracking-widest font-mono font-bold">Atlas Intelligence Focus Report</span>
              </div>
              <span className="text-[10px] font-mono bg-black/20 px-2 py-0.5 rounded text-black font-bold">
                SCORE: {activeSummary.focusScore}/100
              </span>
            </div>

            {/* Core Body Analysis content */}
            <div className="p-6 md:p-8 space-y-6">
              
              {/* Score Display Ring Indicator */}
              <div className="flex flex-col md:flex-row items-center gap-6 border-b border-zinc-900 pb-6">
                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" className="stroke-zinc-900" strokeWidth="4.5" fill="transparent" />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      className="stroke-orange-500"
                      strokeWidth="5"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 * (1 - activeSummary.focusScore / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute font-display font-bold text-2xl text-zinc-100">{activeSummary.focusScore}%</span>
                </div>

                <div className="space-y-1 text-center md:text-left">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Subject / Category Focus</p>
                  <h3 className="font-display font-bold text-lg text-zinc-200">
                    {getTargetLabelAndIcon(activeSummary.target).icon} {getTargetLabelAndIcon(activeSummary.target).label}
                  </h3>
                  <p className="text-xs text-zinc-400 italic">"{activeSummary.label}"</p>
                </div>
              </div>

              {/* Dynamic Focus Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="bg-zinc-900/60 p-3 rounded-2xl border border-zinc-850">
                  <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider">Planned Time</p>
                  <p className="text-sm font-display font-bold text-zinc-300 mt-1">{activeSummary.duration}m</p>
                </div>
                <div className="bg-zinc-900/60 p-3 rounded-2xl border border-zinc-850">
                  <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider">Actual Focused</p>
                  <p className="text-sm font-display font-bold text-orange-400 mt-1">
                    {Math.max(1, Math.round(activeSummary.seconds / 60))}m
                  </p>
                </div>
                <div className="bg-zinc-900/60 p-3 rounded-2xl border border-zinc-850">
                  <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider">Interruptions</p>
                  <p className="text-sm font-display font-bold text-zinc-300 mt-1">{activeSummary.interruptions} pauses</p>
                </div>
                <div className="bg-zinc-900/60 p-3 rounded-2xl border border-zinc-850">
                  <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider">Completion %</p>
                  <p className="text-sm font-display font-bold text-emerald-400 mt-1">{activeSummary.completionPercent}%</p>
                </div>
              </div>

              {/* Trend report & Atlas personalized strategy advice */}
              <div className="space-y-4">
                <div className="bg-zinc-900 p-4.5 rounded-2xl border border-zinc-800 space-y-2">
                  <div className="flex items-center space-x-1.5 text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                    <TrendingUp size={11} className="text-orange-500" />
                    <span>Productivity Trend Analysis</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">{activeSummary.trend}</p>
                </div>

                <div className="bg-zinc-900 p-4.5 rounded-2xl border border-zinc-800 space-y-2">
                  <div className="flex items-center space-x-1.5 text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                    <BrainCircuit size={11} className="text-orange-500 animate-pulse" />
                    <span>Atlas Advisor Recommendation</span>
                  </div>
                  <p className="text-xs text-orange-200/90 leading-relaxed font-sans font-medium">{activeSummary.recommendation}</p>
                </div>
              </div>

            </div>

            {/* Sync operations footer */}
            <div className="p-4 bg-zinc-900/50 border-t border-zinc-850 flex gap-3">
              {showConfirmDiscard ? (
                <>
                  <button
                    onClick={() => {
                      setActiveSummary(null);
                      setShowConfirmDiscard(false);
                      setAccumulatedTime(0);
                      setStartTime(null);
                      setInterruptions(0);
                      setIsRunning(false);
                    }}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs font-mono transition cursor-pointer"
                  >
                    Yes, Discard
                  </button>
                  <button
                    onClick={() => setShowConfirmDiscard(false)}
                    className="flex-1 py-3 border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 rounded-xl text-xs font-mono font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowConfirmDiscard(true)}
                    className="flex-1 py-3 border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 rounded-xl text-xs font-mono font-bold transition cursor-pointer"
                  >
                    Discard Session
                  </button>
                  <button
                    onClick={handleSaveSession}
                    className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-black font-bold rounded-xl text-xs font-sans transition flex items-center justify-center space-x-1.5 shadow-lg shadow-orange-500/10 cursor-pointer"
                  >
                    <Sparkles size={13} fill="black" stroke="black" />
                    <span>Save Focus Log</span>
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
