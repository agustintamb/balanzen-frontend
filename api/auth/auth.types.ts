import { UserRole } from "@/api/users/users.types";

export interface RegisterConsumerBody {
  role: "CONSUMIDOR";
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
  phone: string;
  dni: string;
}

export interface RegisterCommerceBody {
  role: "COMERCIO";
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
  phone: string;
  dni: string;
  business_name: string;
  cuit: string;
}

export type RegisterBody = RegisterConsumerBody | RegisterCommerceBody;

export interface RegisterResponse {
  id: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  business_name?: string;
  access_token: string;
  refresh_token: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    first_name: string;
    last_name: string;
    photo_url: string | null;
    has_address: boolean;
  };
}

export interface ChangePasswordBody {
  current_password: string;
  new_password: string;
  confirm_password: string;
}
