import React, { useEffect, useState } from 'react';
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import { fingerPrintOutline, enterOutline, heartOutline } from 'ionicons/icons';
import { NativeBiometric, BiometryType } from '@capgo/capacitor-native-biometric';
import { useAppStore } from '../store/useAppStore';

export const LockScreen: React.FC = () => {
  const setUnlocked = useAppStore(state => state.setUnlocked);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [hasBiometrics, setHasBiometrics] = useState(false);

  useEffect(() => {
    // Verificar si el teléfono soporta algún tipo de biometría nativa O PIN/Patrón de dispositivo
    const checkAvailability = async () => {
      try {
        const result = await NativeBiometric.isAvailable({ useFallback: true });
        if (result.isAvailable || result.deviceIsSecure) {
          setHasBiometrics(true);
        }
      } catch (err) {
        console.warn("Biometría/Seguridad no disponible", err);
      }
    };
    checkAvailability();
  }, []);

  const handlePinLogin = async () => {
    setError('');
    if (pin.length !== 4) return;

    try {
      const creds = await NativeBiometric.getCredentials({ server: 'app_pin' });
      if (creds.password === pin) {
        setUnlocked(true);
      } else {
        setError('PIN incorrecto. Inténtalo de nuevo.');
        setPin('');
      }
    } catch (err: any) {
      console.error('Error fetching PIN:', err);
      setError('Error al validar el PIN. Inténtalo de nuevo.');
    }
  };

  const handleBiometricLogin = async () => {
    setError('');
    try {
      // Delegamos completamente en el sistema operativo la elección del método (Huella, FaceID o Patrón/PIN nativo)
      await NativeBiometric.verifyIdentity({
        reason: "Identifícate para ingresar a la aplicación.",
        title: "Ingresar a SOS Responder",
        subtitle: "Usa tu método de seguridad predeterminado",
        negativeButtonText: "Cancelar",
        useFallback: true, // Para iOS (usar código del dispositivo si falla biometría)
        allowedBiometryTypes: [
          BiometryType.FINGERPRINT, 
          BiometryType.FACE_AUTHENTICATION, 
          BiometryType.FACE_ID, 
          BiometryType.TOUCH_ID, 
          BiometryType.IRIS_AUTHENTICATION, 
          BiometryType.DEVICE_CREDENTIAL
        ] // Para Android (permitir huella, rostro o credencial del dispositivo)
      });
      setUnlocked(true);
    } catch (err: any) {
      console.error('Error biometría:', err);
      setError('Verificación cancelada o fallida. Ingresa tu PIN de la app.');
    }
  };

  return (
    <IonPage style={{ zIndex: 99999 }}>
      <IonContent scrollY={false}>
        <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-[#f8f9fa]">
          <div className="w-24 h-24 bg-[#4CAF50] rounded-full flex items-center justify-center mb-6 shadow-lg">
            <IonIcon icon={heartOutline} className="text-white text-5xl" />
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">Ingresa tu PIN</h1>
          <p className="text-gray-500 mb-8 max-w-[280px] text-[15px]">
            Ingresa tu PIN de seguridad de 4 dígitos para acceder.
          </p>

          <div className="w-full max-w-[280px] space-y-6">
            <div>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setPin(val);
                }}
                className="w-full px-4 py-4 rounded-xl border border-gray-200 bg-white text-center text-3xl tracking-[1em] focus:outline-none focus:ring-2 focus:ring-[#4CAF50] font-bold text-gray-800 shadow-sm"
                placeholder="••••"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm font-medium">
                {error}
              </p>
            )}

            <button
              onClick={handlePinLogin}
              disabled={pin.length !== 4}
              className="w-full flex items-center justify-center gap-2 bg-[#4CAF50] text-white px-8 py-4 rounded-xl font-bold text-[17px] shadow-[0_8px_16px_rgba(76,175,80,0.3)] disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
            >
              <IonIcon icon={enterOutline} className="text-2xl" />
              Ingresar
            </button>

            {hasBiometrics && (
              <button
                onClick={handleBiometricLogin}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-transparent text-[#2E7D32] border-2 border-[#4CAF50]/30 px-8 py-4 rounded-xl font-bold text-[17px] active:bg-[#4CAF50]/10 transition-all"
              >
                <IonIcon icon={fingerPrintOutline} className="text-2xl" />
                Ingresar con biometría
              </button>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};
