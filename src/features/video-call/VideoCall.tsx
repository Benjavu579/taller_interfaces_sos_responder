import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { IonPage, IonContent } from "@ionic/react";
import { useHistory } from "react-router";

export function VideoCall() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [duration, setDuration] = useState(0);
  const [streamReady, setStreamReady] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const history = useHistory();
  const callerName = "María González"; // Default mock

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        streamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        setStreamReady(true);
      })
      .catch(() => setStreamReady(false));

    const timer = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => {
      clearInterval(timer);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const toggleMic = () => {
    streamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !micOn; });
    setMicOn((v) => !v);
  };

  const toggleCam = () => {
    streamRef.current?.getVideoTracks().forEach((t) => { t.enabled = !camOn; });
    setCamOn((v) => !v);
  };

  const handleHangup = () => {
    history.goBack();
  };

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const ControlBtn = ({
    onClick,
    active = true,
    children,
  }: { onClick?: () => void; active?: boolean; children: React.ReactNode }) => (
    <button onClick={onClick}
      className="flex items-center justify-center"
      style={{
        width: 54,
        height: 54,
        borderRadius: "50%",
        background: active ? "#fff" : "#F4F6F8",
        border: active ? "none" : "1.5px solid #E0E0E0",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        cursor: "pointer",
      }}>
      {children}
    </button>
  );

  return (
    <IonPage>
      <IonContent>
        <div className="min-h-screen flex flex-col" style={{ background: "#E8F5E2" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-10 pb-4"
            style={{ background: "#43A047", borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
            <div>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>En llamada</p>
              <p style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>{callerName}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>{fmt(duration)}</span>
            </div>
          </div>

          {/* Video area */}
          <div className="flex-1 relative flex items-center justify-center mx-4 mt-4 rounded-2xl overflow-hidden"
            style={{ background: "#C8E6C9", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>

            {/* Remote caller placeholder */}
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full flex items-center justify-center"
                style={{ width: 110, height: 110, background: "#43A047", boxShadow: "0 4px 20px rgba(67,160,71,0.4)" }}>
                <span style={{ color: "#fff", fontSize: 52, fontWeight: 800 }}>
                  {callerName.charAt(0).toUpperCase()}
                </span>
              </div>
              <p style={{ color: "#1B5E20", fontSize: 18, fontWeight: 600 }}>{callerName}</p>
              <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.7)" }}>
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: "#43A047" }} />
                <span style={{ color: "#2E7D32", fontSize: 13, fontWeight: 600 }}>{fmt(duration)}</span>
              </div>
            </div>

            {/* Self view */}
            <div className="absolute top-4 right-4 overflow-hidden"
              style={{
                width: 100,
                height: 144,
                borderRadius: 14,
                border: "2.5px solid #43A047",
                background: "#A5D6A7",
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              }}>
              {streamReady && camOn ? (
                <video ref={localVideoRef} autoPlay muted playsInline
                  className="w-full h-full object-cover"
                  style={{ transform: "scaleX(-1)" }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <VideoOff className="w-8 h-8" style={{ color: "#66BB6A" }} />
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="px-6 py-6">
            <div className="flex items-center justify-center gap-4">
              <ControlBtn onClick={() => setSpeakerOn(v => !v)} active={speakerOn}>
                {speakerOn
                  ? <Volume2 className="w-5 h-5" style={{ color: "#333" }} />
                  : <VolumeX className="w-5 h-5" style={{ color: "#aaa" }} />}
              </ControlBtn>

              <ControlBtn onClick={toggleMic} active={micOn}>
                {micOn
                  ? <Mic className="w-5 h-5" style={{ color: "#333" }} />
                  : <MicOff className="w-5 h-5" style={{ color: "#E53935" }} />}
              </ControlBtn>

              {/* Hangup */}
              <button onClick={handleHangup}
                className="flex items-center justify-center"
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: "50%",
                  background: "#E53935",
                  boxShadow: "0 6px 0px #B71C1C, 0 8px 20px rgba(229,57,53,0.45)",
                  border: "none",
                  cursor: "pointer",
                }}>
                <PhoneOff className="w-7 h-7 text-white" />
              </button>

              <ControlBtn onClick={toggleCam} active={camOn}>
                {camOn
                  ? <Video className="w-5 h-5" style={{ color: "#333" }} />
                  : <VideoOff className="w-5 h-5" style={{ color: "#E53935" }} />}
              </ControlBtn>

              <ControlBtn>
                <RotateCcw className="w-5 h-5" style={{ color: "#333" }} />
              </ControlBtn>
            </div>
            <p className="text-center mt-4" style={{ color: "#888", fontSize: 12 }}>
              Videollamada segura cifrada
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
