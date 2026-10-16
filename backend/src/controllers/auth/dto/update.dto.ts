export namespace logout {
  export interface request {
    user_id: string;
  }

  export interface response {
    message: string;
  }

  export interface error {
    message: string;
  }
}