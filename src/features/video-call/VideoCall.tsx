import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Camera, CameraOff, PhoneOff } from "lucide-react";
import { IonPage, IonContent } from "@ionic/react";
import { useHistory } from "react-router";
import { supabase } from "../../supabaseClient";
import EmergencyAlarm from "../../services/EmergencyAlarm";

export function VideoCall() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [duration, setDuration] = useState(0);
  const [remoteStreamReady, setRemoteStreamReady] = useState(false);
  const history = useHistory();
  const location = history.location as any;
  const callerData = location.state?.callerData;
  const callerName = callerData?.caller || "Desconocido";
  const roomId = callerData?.roomId || "emergency-room-1";

  useEffect(() => {
    // Detener la alarma nativa cuando el guardia contesta
    EmergencyAlarm.stopAlarm().catch(console.error);

    const channel = supabase.channel(`room-${roomId}`);
    let pc: RTCPeerConnection | null = null;

    const initWebRTC = async () => {
      try {
        // 1. Obtener stream local primero
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(() => {});
        }

        // 2. Crear PeerConnection
        pc = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" }
          ]
        });
        pcRef.current = pc;

        // 3. Agregar tracks locales al PC
        stream.getTracks().forEach(track => pc!.addTrack(track, stream));

        // 4. Cuando llega video remoto, asignarlo
        pc.ontrack = (event) => {
          console.log("📹 Track remoto recibido:", event.streams[0]);
          const remoteStream = event.streams[0];
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play().catch(e => console.error("Error play remote:", e));
          }
          setRemoteStreamReady(true);
        };

        // 5. Enviar ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            channel.send({
              type: "broadcast",
              event: "webrtc-ice-candidate",
              payload: event.candidate
            });
          }
        };

        pc.oniceconnectionstatechange = () => {
          console.log("ICE state:", pc?.iceConnectionState);
        };

        // 6. Escuchar eventos de señalización
        channel.on("broadcast", { event: "webrtc-offer" }, async ({ payload: offer }) => {
          console.log("📨 Offer recibida del sordo");
          if (!pcRef.current || !offer) return;
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pcRef.current.createAnswer();
          await pcRef.current.setLocalDescription(answer);
          
          channel.send({
            type: "broadcast",
            event: "webrtc-answer",
            payload: answer
          });
          console.log("📤 Answer enviada");
        });

        channel.on("broadcast", { event: "webrtc-ice-candidate" }, async ({ payload: candidate }) => {
          if (candidate && pcRef.current) {
            try {
              await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
              console.warn("Error agregando ICE candidate:", e);
            }
          }
        });

        channel.on("broadcast", { event: "call-ended" }, () => {
          console.log("El otro usuario cortó la llamada");
          history.goBack();
        });

        // 7. Emitir join-call al suscribirse
        channel.subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log("✅ WebRTC listo, uniéndose a la sala:", roomId);
            channel.send({
              type: "broadcast",
              event: "join-call",
              payload: { roomId }
            });
          }
        });

      } catch (err) {
        console.error("Error accediendo a la cámara/mic o inicializando WebRTC:", err);
      }
    };

    initWebRTC();

    const timer = setInterval(() => setDuration((d) => d + 1), 1000);
    
    return () => {
      clearInterval(timer);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      pcRef.current?.close();
      pcRef.current = null;
      channel.send({
        type: "broadcast",
        event: "leave-call",
        payload: { roomId }
      });
      channel.unsubscribe();
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
    const channel = supabase.channel(`room-${roomId}`);
    channel.send({
      type: "broadcast",
      event: "leave-call",
      payload: { roomId }
    });

    streamRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();
    pcRef.current = null;
    history.goBack();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const initials = callerName
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

  return (
    <IonPage>
      <IonContent style={{ '--background': '#0f0f1a' }}>
        <div
          style={{
            minHeight: "100%",
            position: "relative",
            overflow: "hidden",
            backgroundColor: "#0f0f1a",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Main video area (remote) */}
          <div style={{ position: "absolute", inset: 0, backgroundColor: "#1a1a2e" }}>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* Local video small */}
          <div style={{ 
            position: "absolute", 
            top: "20px", 
            right: "20px", 
            width: "100px", 
            height: "144px", 
            borderRadius: "14px", 
            overflow: "hidden",
            zIndex: 20,
            border: "2px solid rgba(255,255,255,0.5)",
            backgroundColor: "#2c2c3a"
          }}>
            {camOn && (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
              />
            )}
          </div>

          {/* Top info */}
          <div
            style={{
              position: "relative",
              zIndex: 10,
              paddingTop: "70px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "#1d4ed8",
                border: "3px solid rgba(255,255,255,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: 700,
                color: "white",
              }}
            >
              {initials}
            </div>

            {/* Name */}
            <p style={{ color: "white", fontSize: "20px", fontWeight: 700, margin: 0, textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>
              {callerName}
            </p>

            {/* Status / timer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "rgba(0,0,0,0.4)",
                borderRadius: "20px",
                padding: "6px 14px",
              }}
            >
              {!remoteStreamReady ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "13px" }}>Conectando cámara y operador...</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "13px", fontVariantNumeric: "tabular-nums" }}>
                    {formatTime(duration)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Bottom controls */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              padding: "24px 32px 36px",
              background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "20px",
            }}
          >
            {/* Mute */}
            <button
              onClick={toggleMic}
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: !micOn ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.2)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              {!micOn ? <MicOff size={22} color="#1e293b" /> : <Mic size={22} color="white" />}
            </button>

            {/* End call */}
            <button
              onClick={handleHangup}
              style={{
                width: "68px",
                height: "68px",
                borderRadius: "50%",
                backgroundColor: "#dc2626",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(220,38,38,0.6)",
              }}
            >
              <PhoneOff size={28} color="white" />
            </button>

            {/* Camera */}
            <button
              onClick={toggleCam}
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: !camOn ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.2)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              {!camOn ? <CameraOff size={22} color="#1e293b" /> : <Camera size={22} color="white" />}
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
