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
