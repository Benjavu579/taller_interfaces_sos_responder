import { useState } from "react";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";
import { IonPage, IonContent, IonModal } from "@ionic/react";
import { useHistory } from "react-router";
import { useAppStore } from "../../store/useAppStore";
import { initSocket, loginOperator } from "../../services/api";

function formatRut(value: string): string {
  const clean = value.replace(/[^0-9kK]/g, "");
  if (clean.length === 0) return "";
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1).toUpperCase();
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return formatted ? `${formatted}-${dv}` : dv;
}

function validateRut(rut: string): boolean {
  const clean = rut.replace(/[^0-9kK]/g, "");
  return clean.length >= 2 && clean.length <= 9;
}

export function LoginScreen() {
  const [rut, setRut] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Terms and conditions state
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const history = useHistory();
  const setLogin = useAppStore(state => state.setLogin);
  const setPhone = useAppStore(state => state.setPhone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!termsAccepted) {
      setShowTermsModal(true);
      return;
    }

    if (!validateRut(rut)) { setError("RUT inválido. Verifica el formato."); return; }
    if (password.length < 4) { setError("Contraseña debe tener al menos 4 caracteres."); return; }
    
    setLoading(true);
    
    try {
      const response = await loginOperator(rut, password);
      
      const realName = response.data?.name || "Operador";
      
      setLogin(rut, realName);
      
      if (rut === "11.111.111-1" && response.data?.phone) {
        setPhone(response.data.phone);
        const socket = initSocket(rut);
        socket.emit("operator-online", { rut, name: realName });
        socket.emit("register-operator", { 
          phone: response.data.phone, 
          name: realName,
          rut: rut
        });
      } else {
        // Initialize socket and emit online status
        const socket = initSocket(rut);
        socket.emit("operator-online", { rut, name: realName });
      }

      history.replace("/");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent>
        <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10" style={{ background: "#E8F5E2" }}>
          <div className="w-full max-w-sm flex flex-col items-center">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-500 hover:scale-105 active:scale-95 relative overflow-hidden"
                style={{ 
                  background: "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)", 
                  boxShadow: "0 8px 24px rgba(46,125,50,0.4)" 
                }}>
                <span style={{ fontSize: 40 }} className="animate-pulse">📞</span>
              </div>
              <h1 style={{ color: "#2E7D32", fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px" }}>
                SOS Responder
              </h1>
              <p className="mt-1 text-center" style={{ color: "#666", fontSize: 14 }}>
                Emergencias accesibles para todos
              </p>
            </div>

            {/* Card */}
            <div className="w-full rounded-3xl p-6" style={{ background: "#fff", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* RUT */}
                <div>
                  <label style={{ color: "#444", fontSize: 13, fontWeight: 600 }}>RUT</label>
                  <input
                    type="text"
                    value={rut}
                    onChange={(e) => { setRut(formatRut(e.target.value)); setError(""); }}
                    placeholder="12.345.678-9"
                    maxLength={12}
                    className="w-full mt-1 focus:outline-none transition-all duration-300 focus:ring-2 focus:ring-[#43A047]/40 focus:bg-white"
                    style={{
                      background: "#F4F6F8",
                      border: "1.5px solid #E0E0E0",
                      borderRadius: 10,
                      padding: "12px 14px",
                      color: "#222",
                      fontSize: 16,
                    }}
                  />
                </div>

                {/* Password */}
                <div>
                  <label style={{ color: "#444", fontSize: 13, fontWeight: 600 }}>Contraseña</label>
                  <div className="relative mt-1">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(""); }}
                      placeholder="••••••••"
                      className="w-full focus:outline-none pr-11 transition-all duration-300 focus:ring-2 focus:ring-[#43A047]/40 focus:bg-white"
                      style={{
                        background: "#F4F6F8",
                        border: "1.5px solid #E0E0E0",
                        borderRadius: 10,
                        padding: "12px 14px",
                        color: "#222",
                        fontSize: 16,
                      }}
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2">
                      {showPass
                        ? <EyeOff className="w-5 h-5" style={{ color: "#999" }} />
                        : <Eye className="w-5 h-5" style={{ color: "#999" }} />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 rounded-xl px-3 py-2"
                    style={{ background: "#FFF3F3", border: "1px solid #FFCDD2" }}>
                    <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: "#E53935" }} />
                    <p style={{ color: "#E53935", fontSize: 13 }}>{error}</p>
                  </div>
                )}

                {/* Button */}
                <button type="submit" disabled={loading}
                  className="w-full transition-all duration-300 active:scale-[0.98] active:shadow-sm"
                  style={{
                    background: "linear-gradient(135deg, #43A047 0%, #2E7D32 100%)",
                    borderRadius: 12,
                    padding: "14px",
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: 700,
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.8 : 1,
                    boxShadow: "0 6px 16px rgba(46,125,50,0.4)",
                    marginTop: 12,
                  }}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Verificando...
                    </span>
                  ) : "Ingresar"}
                </button>

                <p 
                  onClick={() => setShowTermsModal(true)}
                  className="text-center" 
                  style={{ color: "#43A047", fontSize: 13, textDecoration: "underline", cursor: "pointer" }}
                >
                  Términos y Condiciones
                </p>
              </form>
            </div>

            <p className="mt-6 text-center" style={{ color: "#888", fontSize: 11 }}>
              Sistema exclusivo para personal autorizado
            </p>
          </div>
        </div>

        {/* Modal de Términos y Condiciones */}
        <IonModal 
          isOpen={showTermsModal} 
          onDidDismiss={() => setShowTermsModal(false)}
          initialBreakpoint={0.5}
          breakpoints={[0, 0.5]}
          className="terms-modal"
        >
          <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#fff", padding: "0 24px", overflow: "hidden" }}>
            {/* Header */}
            <div className="flex items-center justify-between pt-4 pb-2" style={{ flexShrink: 0 }}>
              <h2 className="font-bold text-gray-900" style={{ fontSize: 18 }}>Términos y Condiciones</h2>
              <button onClick={() => setShowTermsModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ background: "#F4F6F9" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Caja de texto – altura fija, scroll solo dentro de esta caja */}
            <div 
              className="rounded-2xl text-[13px] leading-relaxed text-gray-600 p-4"
              style={{ 
                background: "#F4F6F9", 
                maxHeight: 150,
                overflowY: "auto",
                WebkitOverflowScrolling: "touch",
                flexShrink: 0,
              }}
            >
              <p className="mb-2">
                Al utilizar SOS Responder, usted acepta que esta aplicación es una herramienta de asistencia para situaciones de emergencia. La información personal proporcionada (número telefónico y dirección) será utilizada únicamente para facilitar la respuesta a emergencias.
              </p>
              <p>
                Nos comprometemos a proteger su privacidad y seguridad. Los datos serán tratados conforme a la ley de protección de datos vigente. Esta aplicación no reemplaza los servicios de emergencia oficiales.
              </p>
            </div>

            {/* Checkbox – siempre visible */}
            <label className="flex items-center gap-3 cursor-pointer py-2 px-1 group" style={{ flexShrink: 0 }}>
              <div 
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-300 ease-out ${termsAccepted ? 'bg-[#43A047] border-[#43A047] scale-105' : 'bg-white border-gray-300 group-active:scale-95'}`}
              >
                {termsAccepted && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <input 
                type="checkbox" 
                className="hidden"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <span className="text-[13px] text-gray-700 font-medium leading-tight">He leído y acepto los términos y condiciones.</span>
            </label>

            {/* Botones – siempre visibles */}
            <div className="flex gap-3 pb-4" style={{ flexShrink: 0 }}>
              <button 
                onClick={() => setShowTermsModal(false)}
                className="flex-1 font-bold text-[13px] tracking-wide transition-all duration-200 active:scale-[0.96]"
                style={{ 
                  background: "#F4F6F9", 
                  color: "#555", 
                  borderRadius: "100px", 
                  padding: "14px 0" 
                }}
              >
                CERRAR
              </button>
              <button 
                onClick={() => {
                  if (termsAccepted) {
                    setShowTermsModal(false);
                  }
                }}
                disabled={!termsAccepted}
                className="flex-1 font-bold text-[13px] tracking-wide transition-all duration-200 active:scale-[0.96]"
                style={{ 
                  background: termsAccepted ? "linear-gradient(135deg, #43A047 0%, #2E7D32 100%)" : "#D9D9D9", 
                  color: termsAccepted ? "#fff" : "#999",
                  borderRadius: "100px", 
                  padding: "14px 0",
                  cursor: termsAccepted ? "pointer" : "not-allowed",
                  boxShadow: termsAccepted ? "0 4px 12px rgba(46,125,50,0.3)" : "none",
                }}
              >
                ACEPTAR
              </button>
            </div>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
}
