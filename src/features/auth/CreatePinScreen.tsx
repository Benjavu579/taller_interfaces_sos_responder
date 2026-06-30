import React, { useState } from 'react';
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import { keyOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { useHistory } from 'react-router';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { useAppStore } from '../../store/useAppStore';

export const CreatePinScreen: React.FC = () => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const setHasAppPin = useAppStore(state => state.setHasAppPin);
  const setUnlocked = useAppStore(state => state.setUnlocked);
  const history = useHistory();

  const handleCreate = async () => {
    setError('');
    
    if (pin.length !== 4 || confirmPin.length !== 4) {
      setError('El PIN debe tener exactamente 4 dígitos.');
      return;
    }

    if (pin !== confirmPin) {
      setError('Los PIN no coinciden. Inténtalo de nuevo.');
      setConfirmPin('');
      return;
    }

    try {
      // Guardar el PIN en el almacenamiento seguro del dispositivo
      await NativeBiometric.setCredentials({
        server: 'app_pin',
        username: 'user_pin',
        password: pin,
      });

      // Marcar el PIN como configurado y desbloquear la app
      setHasAppPin(true);
      setUnlocked(true);
      
      // Volver a la raíz para que App.tsx nos redirija a donde corresponde (PhoneSetup o Main Tabs)
      history.replace('/');
    } catch (err: any) {
      console.error('Error saving PIN:', err);
      setError('Error al guardar el PIN de forma segura. Inténtelo de nuevo.');
    }
  };

  return (
    <IonPage>
      <IonContent scrollY={false}>
        <div className="h-full flex flex-col items-center justify-center p-8 bg-[#f8f9fa]">
          <div className="w-20 h-20 bg-[#4CAF50]/10 rounded-full flex items-center justify-center mb-6">
            <IonIcon icon={keyOutline} className="text-[#4CAF50] text-4xl" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">Crea tu PIN de seguridad</h1>
          <p className="text-gray-500 text-center mb-8 text-[15px] max-w-[280px]">
            Este PIN de 4 dígitos te servirá para ingresar rápidamente a la aplicación en futuros accesos.
          </p>

          <div className="w-full max-w-[280px] space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ingresa un PIN (4 dígitos)
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-4 rounded-xl border border-gray-200 bg-white text-center text-2xl tracking-[1em] focus:outline-none focus:ring-2 focus:ring-[#4CAF50] font-bold text-gray-800 shadow-sm"
                placeholder="••••"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirma tu PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-4 rounded-xl border border-gray-200 bg-white text-center text-2xl tracking-[1em] focus:outline-none focus:ring-2 focus:ring-[#4CAF50] font-bold text-gray-800 shadow-sm"
                placeholder="••••"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm font-medium text-center">
                {error}
              </p>
            )}

            <button
              onClick={handleCreate}
              disabled={pin.length !== 4 || confirmPin.length !== 4}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-[#4CAF50] text-white px-6 py-4 rounded-xl font-bold text-[16px] shadow-lg disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
            >
              <IonIcon icon={checkmarkCircleOutline} className="text-xl" />
              Continuar
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};
