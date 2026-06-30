import { useEffect } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { App as CapacitorApp } from '@capacitor/app';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

import { LoginScreen } from '../features/auth/LoginScreen';
import { PhoneSetup } from '../features/auth/PhoneSetup';
import { CreatePinScreen } from '../features/auth/CreatePinScreen';
import { VideoCall } from '../features/video-call/VideoCall';
import { Tabs } from '../components/Tabs';
import { useAppStore } from '../store/useAppStore';
import { LockScreen } from '../components/LockScreen';


setupIonicReact({
  mode: 'ios', // Usamos ios mode por defecto para un look más nativo
});

export default function App() {
  const isLoggedIn = useAppStore(state => state.isLoggedIn);
  const isPhoneSetup = useAppStore(state => state.isPhoneSetup);
  const hasAppPin = useAppStore(state => state.hasAppPin);
  const isUnlocked = useAppStore(state => state.isUnlocked);
  const setUnlocked = useAppStore(state => state.setUnlocked);

  useEffect(() => {
    const listener = CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      // Bloquear la app en cuanto se va al segundo plano, solo si ya configuró el PIN
      if (!isActive && isLoggedIn && hasAppPin) {
        setUnlocked(false);
      }
    });

    return () => {
      listener.then(l => l.remove());
    };
  }, [isLoggedIn, setUnlocked, hasAppPin]);


  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          {/* Rutas de Autenticación */}
          <Route exact path="/login">
            <LoginScreen />
          </Route>
          <Route exact path="/create-pin">
            <CreatePinScreen />
          </Route>
          <Route exact path="/phone-setup">
            <PhoneSetup />
          </Route>

          {/* Ruta principal con Tabs */}
          <Route path="/tabs" component={Tabs} />

          {/* Rutas Globales / Modales Completos */}
          <Route exact path="/call">
            <VideoCall />
          </Route>

          {/* Redirección Inicial basada en el estado */}
          <Route exact path="/">
            {isLoggedIn ? (
              hasAppPin ? (
                isPhoneSetup ? <Redirect to="/tabs/main" /> : <Redirect to="/phone-setup" />
              ) : (
                <Redirect to="/create-pin" />
              )
            ) : (
              <Redirect to="/login" />
            )}
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>

      {/* Pantalla de bloqueo (Ingreso PIN/Biometría) al abrir o reanudar */}
      {isLoggedIn && hasAppPin && !isUnlocked && <LockScreen />}
    </IonApp>
  );
}
