import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
} from '@ionic/react';
import { timeOutline, homeOutline } from 'ionicons/icons';
import { Route, Redirect } from 'react-router';
import { CallHistoryScreen } from '../features/call-history/CallHistoryScreen';
import { StandbyScreen } from '../features/standby/StandbyScreen';

export const Tabs = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/tabs/history" component={CallHistoryScreen} />
        <Route exact path="/tabs/main" component={StandbyScreen} />
        <Route exact path="/tabs">
          <Redirect to="/tabs/main" />
        </Route>
      </IonRouterOutlet>
      <IonTabBar slot="bottom" style={{ "--background": "#fff", "--border": "1px solid #E8ECF0", paddingTop: 6, paddingBottom: "env(safe-area-inset-bottom, 8px)" }}>
        <IonTabButton tab="main" href="/tabs/main" style={{ "--color-selected": "#2E7D32", "--color": "#999" }}>
          <IonIcon icon={homeOutline} />
          <IonLabel className="font-semibold" style={{ fontSize: 11 }}>Principal</IonLabel>
        </IonTabButton>
        <IonTabButton tab="history" href="/tabs/history" style={{ "--color-selected": "#2E7D32", "--color": "#999" }}>
          <IonIcon icon={timeOutline} />
          <IonLabel className="font-semibold" style={{ fontSize: 11 }}>Historial</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};
