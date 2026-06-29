import { useEffect, useRef, useState } from "react";
import { Phone, PhoneOff } from "lucide-react";

interface Props {
  callerName: string;
  onAnswer: () => void;
  onReject: () => void;
}

export function IncomingCall({ callerName, onAnswer, onReject }: Props) {
  const [flashOn, setFlashOn] = useState(true);
  const [dotCount, setDotCount] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flashRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dotsRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;

    const playAlarm = () => {
      const freqs = [880, 880, 1100];
      let t = ctx.currentTime;
      freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        osc.start(t);
        osc.stop(t + 0.18);
        t += 0.22;
      });
    };

    playAlarm();
    intervalRef.current = setInterval(playAlarm, 1600);
    flashRef.current = setInterval(() => setFlashOn((v) => !v), 350);
    dotsRef.current = setInterval(() => setDotCount((v) => (v % 3) + 1), 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (flashRef.current) clearInterval(flashRef.current);
      if (dotsRef.current) clearInterval(dotsRef.current);
      ctx.close();
    };
  }, []);

  const dots = ".".repeat(dotCount);
  const bgNow = flashOn ? "#E53935" : "#B71C1C";

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-between px-6 transition-colors duration-100"
      style={{ backgroundColor: bgNow, paddingTop: 72, paddingBottom: 56 }}
    >
      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none transition-opacity duration-100"
        style={{
          background: "radial-gradient(ellipse at 50% 10%, rgba(255,200,200,0.3) 0%, transparent 65%)",
          opacity: flashOn ? 1 : 0,
        }} />

      {/* Top content */}
      <div className="flex flex-col items-center z-10">
        {/* Emergency badge */}
        <div className="px-5 py-1.5 rounded-full mb-6"
          style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.2)" }}>
          <span style={{ color: "#E53935", fontSize: 13, fontWeight: 800, letterSpacing: "0.06em" }}>
            🚨 EMERGENCIA
          </span>
        </div>

        {/* Avatar */}
        <div className="flex items-center justify-center mb-6 transition-all duration-100"
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: flashOn ? "#fff" : "rgba(255,255,255,0.85)",
            boxShadow: flashOn
              ? "0 0 0 12px rgba(255,255,255,0.2), 0 0 40px rgba(255,255,255,0.3)"
              : "0 0 0 6px rgba(255,255,255,0.1)",
          }}>
          <span style={{ fontSize: 60, fontWeight: 800, color: "#E53935" }}>
            {callerName.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Message */}
        <h1 className="text-white text-center" style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.1 }}>
          ¡Contesta!
        </h1>
        <p className="text-center mt-2" style={{ color: "rgba(255,255,255,0.85)", fontSize: 18 }}>
          es una emergencia
        </p>
        <p className="text-center mt-1" style={{ color: "#fff", fontSize: 22, fontWeight: 800 }}>
          de {callerName}
        </p>
        <p className="mt-4" style={{ color: "rgba(255,255,255,0.65)", fontSize: 14 }}>
          Llamando{dots}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-center gap-16 z-10 w-full">
        {/* Reject */}
        <div className="flex flex-col items-center gap-2">
          <button onClick={onReject}
            className="flex items-center justify-center"
            style={{
              width: 68,
              height: 68,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.35)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              border: "2px solid rgba(255,255,255,0.2)",
            }}>
            <PhoneOff className="w-7 h-7 text-white" />
          </button>
          <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 600 }}>Rechazar</span>
        </div>

        {/* Answer */}
        <div className="flex flex-col items-center gap-2">
          <button onClick={onAnswer}
            className="flex items-center justify-center animate-bounce"
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "#43A047",
              boxShadow: "0 8px 0px #2E7D32, 0 10px 30px rgba(67,160,71,0.5)",
              border: "3px solid #fff",
            }}>
            <Phone className="w-9 h-9 text-white" />
          </button>
          <span style={{ color: "#fff", fontSize: 13, fontWeight: 800 }}>CONTESTAR</span>
        </div>
      </div>
    </div>
  );
}
