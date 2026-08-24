// ─── Auth Domain Models ───────────────────────────────────────────────────────

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
  token: string;
  refreshToken?: string;
  expiresIn?: number;
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

/**
 * Safely extracts user's active room ID whether backend sends a single number or array.
 */
export function getUserRoomId(userData: UserData | null | undefined): number | null {
  if (!userData) return null;

  const raw = userData.roomsId ?? userData.roomId;
  if (raw === null || raw === undefined) return null;

  if (typeof raw === 'number' && !isNaN(raw) && raw > 0) {
    return raw;
  }

  if (typeof raw === 'string') {
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  if (Array.isArray(raw) && raw.length > 0) {
    const first = raw[0];
    if (typeof first === 'number' && !isNaN(first) && first > 0) return first;
    if (typeof first === 'string') {
      const parsed = parseInt(first, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  }

  return null;
}


/**
 * Generic API wrapper matching the Spring Boot ApiResponse<T> contract.
 */
export interface ApiResponse<T> {
  localDateTime: string;
  status: number;
  message: string;
  data?: T;
  errors?: Record<string, string>;
}

