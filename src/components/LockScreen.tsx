import React, { useEffect, useState } from 'react';
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import { lockClosedOutline, fingerPrintOutline } from 'ionicons/icons';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { useAppStore } from '../store/useAppStore';

export const LockScreen: React.FC = () => {
  const setUnlocked = useAppStore(state => state.setUnlocked);
  const [error, setError] = useState('');

  const requestBiometric = async () => {
    try {
      const result = await NativeBiometric.isAvailable();
      if (!result.isAvailable) {
        // Si no hay biometría ni PIN configurado, permitimos el paso libre
        setUnlocked(true);
        return;
      }
      
      const verified = await NativeBiometric.verifyIdentity({
        reason: "Para continuar, identifíquese.",
        title: "Desbloquear SOS Responder",
        subtitle: "Use su huella, rostro o PIN",
      });

      setUnlocked(true);
    } catch (err: any) {
      console.error('Error biometric:', err);
      setError('Autenticación fallida o cancelada.');
    }
  };

  useEffect(() => {
    requestBiometric();
  }, []);

  return (
    <IonPage style={{ zIndex: 99999 }}>
      <IonContent scrollY={false}>
        <div className="h-full flex flex-col items-center justify-center p-8 text-center" style={{ background: "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)" }}>
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm shadow-xl">
            <IonIcon icon={lockClosedOutline} className="text-white text-5xl" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">App Bloqueada</h1>
          <p className="text-white/80 mb-12 max-w-[250px] text-[15px]">
            Por seguridad, confirme su identidad para acceder al sistema.
          </p>

          <button 
            onClick={requestBiometric}
            className="flex items-center justify-center gap-2 bg-white text-[#2E7D32] px-8 py-3.5 rounded-[20px] font-bold text-[17px] shadow-[0_8px_16px_rgba(0,0,0,0.15)] active:scale-95 transition-all"
          >
            <IonIcon icon={fingerPrintOutline} className="text-2xl" />
            Desbloquear
          </button>

          {error && (
            <p className="mt-6 text-red-200 text-sm font-medium">
              {error}
            </p>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};
