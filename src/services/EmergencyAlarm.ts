import { registerPlugin } from '@capacitor/core';

export interface EmergencyAlarmPlugin {
  startAlarm(): Promise<void>;
  stopAlarm(): Promise<void>;
  requestPermissions(): Promise<void>;
}

const EmergencyAlarm = registerPlugin<EmergencyAlarmPlugin>('EmergencyAlarm');

export default EmergencyAlarm;
