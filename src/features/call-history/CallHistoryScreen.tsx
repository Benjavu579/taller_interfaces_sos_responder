import { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonIcon,
  IonModal,
  IonFooter,
  IonHeader,
} from '@ionic/react';
import { callOutline, videocamOutline, closeCircleOutline, closeOutline, timeOutline, chevronForwardOutline } from 'ionicons/icons';
import { CallRecord } from '../../services/mockData';
import { BACKEND_URL } from '../../services/api';

export const CallHistoryScreen = () => {
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [historyData, setHistoryData] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/historial`);
        if (response.ok) {
          const data = await response.json();
          setHistoryData(data);
        } else {
          console.error("Error fetching history:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'missed': return 'Perdida';
      case 'completed': return 'Completada';
      case 'rejected': return 'Rechazada';
      default: return status;
    }
  };

  return (
    <IonPage>
      <IonContent style={{ "--background": "#E8F5E2" }} scrollY={true}>
        {/* Custom Header */}
        <div
          className="px-5 pt-12 pb-8"
          style={{
            background: "linear-gradient(135deg, #43A047 0%, #2E7D32 100%)",
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
            boxShadow: "0 4px 20px rgba(67,160,71,0.3)",
          }}
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
              <IonIcon icon={timeOutline} style={{ fontSize: 22, color: "#fff" }} />
            </div>
            <div>
              <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px" }}>Historial</h1>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, fontWeight: 500 }}>
                {loading ? 'Cargando...' : `${historyData.length} llamada${historyData.length !== 1 ? 's' : ''} registrada${historyData.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
        </div>

        {/* Call List */}
        <div className="px-5 -mt-4">
          <div className="flex flex-col gap-3">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Cargando historial...</div>
            ) : historyData.map((call) => (
              <div
                key={call.id}
                onClick={() => setSelectedCall(call)}
                className="rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 active:scale-[0.97] cursor-pointer"
                style={{
                  background: "#fff",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    background: call.status === 'missed'
                      ? 'linear-gradient(135deg, #EF5350 0%, #C62828 100%)'
                      : 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                    boxShadow: call.status === 'missed'
                      ? '0 4px 12px rgba(239,83,80,0.3)'
                      : '0 4px 12px rgba(76,175,80,0.3)',
                  }}
                >
                  <IonIcon
                    icon={call.status === 'missed' ? closeCircleOutline : callOutline}
                    style={{ fontSize: 22, color: "#fff" }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-gray-900 leading-tight truncate" style={{ fontSize: 15 }}>{call.callerName}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: call.status === 'missed' ? '#FFF3F3' : '#E8F5E2',
                        color: call.status === 'missed' ? '#E53935' : '#2E7D32',
                      }}
                    >
                      {getStatusLabel(call.status)}
                    </span>
                    <span className="text-[12px] text-gray-400">{call.date}</span>
                  </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2 shrink-0">
                  {call.videoUrl && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#E8F5E2" }}>
                      <IonIcon icon={videocamOutline} style={{ color: "#43A047", fontSize: 16 }} />
                    </div>
                  )}
                  <div className="flex flex-col items-end">
                    <span className="text-[12px] font-bold text-gray-500">{call.duration}</span>
                  </div>
                  <IonIcon icon={chevronForwardOutline} style={{ fontSize: 16, color: "#ccc" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Empty state hint */}
          <div className="mt-6 text-center pb-8">
            <p style={{ color: "#999", fontSize: 12 }}>
              Toca una llamada para ver sus detalles
            </p>
          </div>
        </div>

        {/* Modal Detalle de Llamada */}
        <IonModal
          isOpen={!!selectedCall}
          onDidDismiss={() => setSelectedCall(null)}
          initialBreakpoint={0.65}
          breakpoints={[0, 0.65]}
        >
          <IonPage>
            <IonHeader className="ion-no-border" style={{ background: "#fff" }}>
              <div className="flex items-center justify-between px-6 pt-6 pb-3">
                <h2 className="font-bold text-gray-900" style={{ fontSize: 18 }}>Detalle de llamada</h2>
                <button
                  onClick={() => setSelectedCall(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: "#F4F6F9" }}
                >
                  <IonIcon icon={closeOutline} style={{ fontSize: 20, color: "#666" }} />
                </button>
              </div>
            </IonHeader>

            <IonContent style={{ "--background": "#fff" }}>
              <div className="px-6 py-2">
                {/* Call summary card */}
                {selectedCall && (
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                      style={{
                        background: selectedCall.status === 'missed'
                          ? 'linear-gradient(135deg, #EF5350 0%, #C62828 100%)'
                          : 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                        boxShadow: selectedCall.status === 'missed'
                          ? '0 4px 12px rgba(239,83,80,0.3)'
                          : '0 4px 12px rgba(76,175,80,0.3)',
                      }}
                    >
                      <IonIcon
                        icon={selectedCall.status === 'missed' ? closeCircleOutline : callOutline}
                        style={{ fontSize: 26, color: "#fff" }}
                      />
                    </div>
                    <div>
                      <h3 className="text-[17px] font-bold text-gray-900">{selectedCall.callerName}</h3>
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full inline-block mt-1"
                        style={{
                          background: selectedCall.status === 'missed' ? '#FFF3F3' : '#E8F5E2',
                          color: selectedCall.status === 'missed' ? '#E53935' : '#2E7D32',
                        }}
                      >
                        {getStatusLabel(selectedCall.status)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Details table */}
                {selectedCall && (
                  <div className="rounded-2xl overflow-hidden" style={{ background: "#F4F6F9" }}>
                    <div className="flex justify-between items-center px-5 py-4" style={{ borderBottom: "1px solid #E8ECF0" }}>
                      <span className="text-[14px] text-gray-500 font-medium">Fecha</span>
                      <span className="text-[14px] text-gray-900 font-bold">{selectedCall.date}</span>
                    </div>
                    <div className="flex justify-between items-center px-5 py-4" style={{ borderBottom: "1px solid #E8ECF0" }}>
                      <span className="text-[14px] text-gray-500 font-medium">Duración</span>
                      <span className="text-[14px] text-gray-900 font-bold">{selectedCall.duration}</span>
                    </div>
                    <div className="flex justify-between items-center px-5 py-4">
                      <span className="text-[14px] text-gray-500 font-medium">Grabación</span>
                      <span className="text-[14px] font-bold" style={{ color: selectedCall.videoUrl ? "#43A047" : "#999" }}>
                        {selectedCall.videoUrl ? 'Disponible' : 'No disponible'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </IonContent>

            <IonFooter className="ion-no-border" style={{ background: "#fff" }}>
              <div className="px-6 py-5 pb-8">
                <button
                  onClick={() => setSelectedCall(null)}
                  className="w-full font-bold text-[14px] tracking-wide transition-all duration-200 active:scale-[0.97]"
                  style={{
                    background: "linear-gradient(135deg, #43A047 0%, #2E7D32 100%)",
                    color: "#fff",
                    borderRadius: "100px",
                    padding: "16px 0",
                    boxShadow: "0 6px 16px rgba(46,125,50,0.3)"
                  }}
                >
                  CERRAR
                </button>
              </div>
            </IonFooter>
          </IonPage>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};
