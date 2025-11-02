export interface FingerprintTemplate {
  base64Template: string;
}

export interface VerifyResponse {
  match: boolean;
}

export interface RegisterResponse {
  success: boolean;
}
