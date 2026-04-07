export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface HealthResponse {
  success: boolean;
  message: string;
  environment: string;
  timestamp: string;
  database: {
    status: string;
    name: string;
  };
  uptime: string;
}
