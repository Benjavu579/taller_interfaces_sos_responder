import { useEffect, useState } from "react";
import { Phone, LogOut, Wifi, Bell } from "lucide-react";
import { IonPage, IonContent, useIonViewWillEnter } from "@ionic/react";
import { useHistory } from "react-router";
import { useAppStore } from "../../store/useAppStore";
import { IncomingCall } from "../video-call/IncomingCall";
import EmergencyAlarm from "../../services/EmergencyAlarm";
import { supabase } from "../../supabaseClient";

export function StandbyScreen() {
  const [time, setTime] = useState(new Date());
  const history = useHistory();
  const userName = useAppStore(state => state.userName);
  const phone = useAppStore(state => state.userPhone);
  const userRut = useAppStore(state => state.userRut);
  const logout = useAppStore(state => state.logout);
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [callerData, setCallerData] = useState<any>(null);

  useEffect(() => {
    const requestPermissions = async () => {
      const asked = localStorage.getItem("dnd_asked");
      if (!asked) {
        try {
          await EmergencyAlarm.requestPermissions();
        } catch (err) {
          console.error("Error al pedir permisos nativos", err);
        }

        try {
          // Pedir permisos de audio y video por primera y única vez
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          stream.getTracks().forEach(track => track.stop());
        } catch (err) {
          console.error("Error al pedir permisos de cámara y micrófono", err);
        }

        localStorage.setItem("dnd_asked", "true");
      }
    };
    requestPermissions();

    const channel = supabase.channel('emergency-calls');
    channel.on('broadcast', { event: 'incoming-call' }, (payload) => {
      console.log("Incoming call via Supabase:", payload);
      setCallerData(payload.payload);
      handleIncomingCall();
    }).subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log("✅ Conectado a Supabase Realtime (emergency-calls)");
      }
    });

    const t = setInterval(() => setTime(new Date()), 1000);
    return () => {
      clearInterval(t);
      channel.unsubscribe();
    };
  }, []);

  useIonViewWillEnter(() => {
    if (phone && userRut) {
      supabase
        .from("operadores")
        .update({ is_available: true, phone, name: userName || "Operador" })
        .eq("rut", userRut)
        .then(({ error }) => {
          if (!error) console.log("Re-registrando operador (Disponible) en Supabase");
        });
    }
  });

  const timeStr = time.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
  const dateStr = time.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" });
  const dateFormatted = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  const firstName = userName ? userName.split(" ")[0] : "Usuario";
  const formattedPhone = phone && phone.startsWith("+569") && phone.length === 12
    ? `+56 9 ${phone.slice(4, 8)} ${phone.slice(8)}`
    : phone;

  const handleLogout = () => {
    logout();
    history.replace("/login");
  };

  const handleIncomingCall = async () => {
    try {
      await EmergencyAlarm.startAlarm();
    } catch (e) {
      console.error("Error starting alarm plugin:", e);
    }
    setShowIncomingCall(true);
  };

  const handleAnswerCall = async () => {
    try {
      await EmergencyAlarm.stopAlarm();
    } catch (e) {
      console.error("Error stopping alarm:", e);
    }
    setShowIncomingCall(false);
    history.push({
      pathname: '/call',
      state: { callerData }
    });
  };

  const handleRejectCall = async () => {
    try {
      await EmergencyAlarm.stopAlarm();
    } catch (e) {
      console.error("Error stopping alarm:", e);
    }
    if (callerData?.roomId) {
      const roomChannel = supabase.channel(`room-${callerData.roomId}`);
      roomChannel.send({
        type: 'broadcast',
        event: 'call-ended',
        payload: { reason: 'rejected' }
      });
    }
    setShowIncomingCall(false);
    setCallerData(null);
  };

  return (
    <IonPage>
      <IonContent scrollY={false}>
        <div className="h-full flex flex-col" style={{ background: "#E8F5E2" }}>
          {/* Header */}
          <div className="px-5 pt-10 pb-6 flex items-center justify-between"
            style={{
              background: "#43A047",
              borderBottomLeftRadius: 28,
              borderBottomRightRadius: 28,
              boxShadow: "0 4px 20px rgba(67,160,71,0.3)",
            }}>
            <div>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>{dateFormatted}</p>
              <p style={{ color: "#fff", fontSize: 22, fontWeight: 800 }}>{timeStr}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.2)" }}>
                <span className="w-2 h-2 rounded-full bg-white inline-block" />
                <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>Activo</span>
              </div>
              <button onClick={handleLogout} className="ml-1 opacity-70 hover:opacity-100 transition-opacity">
                <LogOut className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Profile */}
          <div className="px-5 pt-6 flex items-center gap-4">
            <div className="rounded-full flex items-center justify-center shrink-0"
              style={{ width: 60, height: 60, background: "#43A047", boxShadow: "0 4px 12px rgba(67,160,71,0.35)" }}>
              <span style={{ color: "#fff", fontSize: 24, fontWeight: 800 }}>{firstName.charAt(0)}</span>
            </div>
            <div>
              <p style={{ color: "#1B5E20", fontSize: 20, fontWeight: 700 }}>Hola, {firstName}</p>
              <p style={{ color: "#4A5568", fontSize: 13, lineHeight: 1.4 }}>
                Disponible para recibir emergencias
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Phone className="w-3.5 h-3.5" style={{ color: "#43A047" }} />
                <span style={{ color: "#333", fontSize: 14, fontWeight: 600 }}>{formattedPhone}</span>
              </div>
            </div>
          </div>

          {/* Status card */}
          <div className="px-5 mt-5">
            <div className="rounded-2xl overflow-hidden"
              style={{ background: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
              {/* Row 1 */}
              <div className="flex items-center justify-between px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "#E8F5E2" }}>
                    <Wifi className="w-5 h-5" style={{ color: "#43A047" }} />
                  </div>
                  <span style={{ color: "#1A202C", fontSize: 15, fontWeight: 600 }}>Estado</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                  style={{ background: "#E8F5E2" }}>
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: "#43A047" }} />
                  <span style={{ color: "#2E7D32", fontSize: 12, fontWeight: 700 }}>En línea</span>
                </div>
              </div>

              <div style={{ height: 1, background: "#F0F0F0", margin: "0 16px" }} />

              {/* Row 2 */}
              <div className="flex items-center justify-between px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "#FFF8E1" }}>
                    <Bell className="w-5 h-5" style={{ color: "#F9A825" }} />
                  </div>
                  <span style={{ color: "#1A202C", fontSize: 15, fontWeight: 600 }}>Alertas de sonido</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                  style={{ background: "#FFF8E1" }}>
                  <span style={{ color: "#F9A825", fontSize: 12, fontWeight: 700 }}>Forzado activo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info banner */}
          <div className="px-5 mt-4">
            <div className="rounded-2xl px-4 py-4 flex items-start gap-3"
              style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <span style={{ fontSize: 28 }}>🔔</span>
              <div>
                <p style={{ color: "#1B5E20", fontSize: 14, fontWeight: 700 }}>Esperando llamadas</p>
                <p style={{ color: "#4A5568", fontSize: 12, lineHeight: 1.5, marginTop: 2 }}>
                  Cuando alguien te llame, la pantalla se activará automáticamente aunque el teléfono esté en silencio.
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1" />

          {/* Simulate button */}
          <div className="px-5 pb-10">
            <button
              onClick={handleIncomingCall}
              className="w-full transition-opacity hover:opacity-90"
              style={{
                background: "#E53935",
                borderRadius: 14,
                padding: "16px",
                color: "#fff",
                fontSize: 16,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(229,57,53,0.4)",
              }}>
              🚨 Simular llamada entrante
            </button>
          </div>
        </div>

        {/* We use a Modal or just conditional rendering for Incoming Call?
            Using history.push('/incoming') is better for full screen. */}
        {showIncomingCall && (
          <div className="fixed inset-0 z-50">
            <IncomingCall
              callerName={callerData?.caller || "Paciente Desconocido"}
              onAnswer={handleAnswerCall}
              onReject={handleRejectCall}
            />
          </div>
        )}
      </IonContent>
    </IonPage>
  );
}
