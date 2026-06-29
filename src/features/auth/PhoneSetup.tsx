import { useState } from "react";
import { Lock } from "lucide-react";
import { IonPage, IonContent } from "@ionic/react";
import { useHistory } from "react-router";
import { useAppStore } from "../../store/useAppStore";

export function PhoneSetup() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const history = useHistory();
  const userName = useAppStore(state => state.userName);
  const setPhoneAction = useAppStore(state => state.setPhone);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
    setPhone(digits);
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 8) { setError("Ingresa los 8 dígitos restantes."); return; }
    setPhoneAction("9" + phone);
    history.push("/tabs/main");
  };

  const firstName = userName ? userName.split(" ")[0] : "Usuario";

  return (
    <IonPage>
      <IonContent>
        <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10" style={{ background: "#E8F5E2" }}>
          <div className="w-full max-w-sm flex flex-col items-center">
            {/* Icon */}
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: "#43A047", boxShadow: "0 4px 16px rgba(67,160,71,0.35)" }}>
              <span style={{ fontSize: 40 }}>📱</span>
            </div>

            <h2 className="mb-1" style={{ color: "#2E7D32", fontSize: 24, fontWeight: 800 }}>
              Hola, {firstName}
            </h2>
            <p className="text-center mb-8" style={{ color: "#666", fontSize: 14, lineHeight: 1.5 }}>
              Para recibir llamadas de emergencia<br />necesitamos tu número de teléfono
            </p>

            {/* Card */}
            <div className="w-full rounded-3xl p-6" style={{ background: "#fff", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label style={{ color: "#444", fontSize: 13, fontWeight: 600 }}>Número de celular</label>
                  <div className="flex items-center mt-1"
                    style={{
                      background: "#F4F6F8",
                      border: "1.5px solid #E0E0E0",
                      borderRadius: 10,
                      overflow: "hidden",
                    }}>
                    <span className="px-3 py-3 shrink-0"
                      style={{ color: "#444", fontSize: 15, borderRight: "1.5px solid #E0E0E0" }}>
                      🇨🇱 +56 9
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={handleChange}
                      placeholder="XXXX XXXX"
                      className="flex-1 bg-transparent focus:outline-none px-3"
                      style={{ color: "#222", fontSize: 16, padding: "12px 12px" }}
                    />
                  </div>
                  {error && <p className="mt-1.5" style={{ color: "#E53935", fontSize: 13 }}>{error}</p>}
                </div>

                <div className="flex items-start gap-2 rounded-xl px-3 py-3"
                  style={{ background: "#F4F6F8" }}>
                  <Lock className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#43A047" }} />
                  <p style={{ color: "#777", fontSize: 12, lineHeight: 1.5 }}>
                    Tu número solo se usará para identificarte cuando alguien necesite ayuda de emergencia.
                  </p>
                </div>

                <button type="submit"
                  className="w-full"
                  style={{
                    background: "#43A047",
                    borderRadius: 12,
                    padding: "14px",
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(67,160,71,0.4)",
                  }}>
                  Confirmar y activar
                </button>
              </form>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
