import { NativeModules } from "react-native";
import axios from "axios";
import * as AES from "react-native-aes-crypto";
import type {
  FingerprintTemplate,
  RegisterResponse,
  VerifyResponse,
} from "../types/fingerprint";

const { FingerprintModule } = NativeModules;

const LOCAL_KEY = "my-local-256-bit-secret-key";
const IV = "1234567890123456"; //16-byte IV (for AES CBC) // TODO: Know its use

const encryptAES = async (data: string, key: string): Promise<string> => {
  return AES.encrypt(data, key, IV, "aes-256-cbc");
};

export const captureFingerprint = async (): Promise<FingerprintTemplate> => {
  try {
    const base64Template: string = await FingerprintModule.captureFingerprint();
    return { base64Template };
  } catch (error) {
    console.error("Fingerprint capture failed:", error);
    throw new Error("Fingerprint capture failed");
  }
};

export const registerFingerprint = async (
  userId: string
): Promise<RegisterResponse> => {
  const template = await captureFingerprint();
  const encryptedTemplate = await encryptAES(
    template.base64Template,
    LOCAL_KEY
  );

  //   const response = await axios.post<RegisterResponse>("/register-fingerprint", {
  //     userId,
  //     fingerprintData: encryptedTemplate,
  //   });
  //   return response.data;
  console.log("Encrypted template:", encryptedTemplate);
  return { success: true };
};

export const verifyFingerprint = async (
  userId: string
): Promise<VerifyResponse> => {
  const template = await captureFingerprint();
  const encryptedTemplate = await encryptAES(
    template.base64Template,
    LOCAL_KEY
  );
  //   const response = await axios.post<VerifyResponse>("/verify-fingerprint", {
  //     userId,
  //     fingerprintData: encryptedTemplate,
  //   });
  //   return response.data;
  console.log("Encrypted template for verification:", encryptedTemplate);
  return { match: true };
};
