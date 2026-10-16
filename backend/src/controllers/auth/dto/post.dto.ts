export namespace login {
  export interface request {
    username: string;
    password: string;
  }

  export interface user {
    user_id: string;
    username: string;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    suffix?: string | null;
    sex?: string | null;
    email: string;
    contact_number?: string | null;
    address?: string | null;
    birthdate?: string | null;
    role?: string;
    account_status?: boolean;
    [key: string]: unknown;
  }

  export interface response {
    message: string;
    accountType: "user" | "patient";
    user: login.user;
    token: string;
    refreshToken: string;
  }

  export interface error {
    message?: string;
    error?: string;
  }
}