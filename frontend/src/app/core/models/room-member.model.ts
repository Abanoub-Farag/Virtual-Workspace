export enum MemberStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  AWAY = 'AWAY',
  BUSY = 'BUSY'
}

export interface RoomMember {
  id: number;
  status: MemberStatus | string;
  firstName: string;
  lastName: string;
  bio?: string;
  gender?: string;
  dateOfBirth?: string;
}

export interface ApiResponse<T> {
  localDateTime: string;
  status: number;
  message: string;
  data: T;
  errors: Record<string, any> | string[] | string | null;
}
