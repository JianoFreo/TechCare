
export namespace logout {
  export interface body {
    user_id?: string;
  }

  export interface response {
    message: string;
  }

  export interface error {
    message: string;
  }
}
