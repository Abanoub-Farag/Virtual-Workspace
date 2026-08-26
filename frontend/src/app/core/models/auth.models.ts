export interface RegisterRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthData {
  jwtToken: string;
  refreshToken: string;
}

export interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  bio?: string;
  gender?: string;
  dateOfBirth?: string;
  roomsId?: number[] | number | null;
  roomId?: number | null;
}

export function getUserRoomId(userData: UserData | null | undefined): number | null {
  if (!userData) return null;

  const raw = userData.roomsId ?? userData.roomId;
  if (raw === null || raw === undefined) return null;

  const target = Array.isArray(raw) ? raw[0] : raw;
  return parsePositiveInteger(target);
}

function parsePositiveInteger(val: any): number | null {
  if (typeof val === 'number' && !isNaN(val) && val > 0) {
    return val;
  }

  if (typeof val === 'string') {
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  return null;
}

export interface ApiResponse<T> {
  localDateTime: string;
  status: number;
  message: string;
  data?: T;
  errors?: Record<string, string>;
}
