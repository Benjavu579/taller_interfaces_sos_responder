export interface CallRecord {
  id: string;
  callerName: string;
  date: string;
  duration: string;
  status: 'missed' | 'completed' | 'rejected';
  videoUrl?: string; // Para el mock de Daily.co
}

export const mockCallHistory: CallRecord[] = [
  {
    id: '1',
    callerName: 'María González',
    date: 'Hoy, 10:30 AM',
    duration: '05:23',
    status: 'completed',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
  },
  {
    id: '2',
    callerName: 'Carlos López',
    date: 'Ayer, 04:15 PM',
    duration: '00:00',
    status: 'missed',
  },
  {
    id: '3',
    callerName: 'Soporte Técnico',
    date: '25 Jun, 11:00 AM',
    duration: '12:45',
    status: 'completed',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
  },
];
