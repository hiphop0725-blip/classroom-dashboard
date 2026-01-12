export interface ScheduleItem {
  id: string;
  subject: string;
  time: string;
  isActive: boolean;
}

export interface AttendanceData {
  expected: number;
  actual: number;
  absentNames: string;
}

export enum StatusMode {
  IDLE = 'IDLE',
  TIMER = 'TIMER',
  NOISE = 'NOISE'
}

export interface AIGenerationResponse {
  schedule?: ScheduleItem[];
  memo?: string;
}
