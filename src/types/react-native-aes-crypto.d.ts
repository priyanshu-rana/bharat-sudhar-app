declare module 'react-native-aes-crypto' {
  export function pbkdf2(password: string, salt: string, cost: number, length: number): Promise<string>;
  export function encrypt(text: string, key: string, iv: string, algorithm?: string): Promise<string>;
  export function decrypt(ciphertext: string, key: string, iv: string, algorithm?: string): Promise<string>;
  export function hmac256(ciphertext: string, key: string): Promise<string>;
  export function randomKey(length: number): Promise<string>;
  export function sha1(text: string): Promise<string>;
  export function sha256(text: string): Promise<string>;
  export function sha512(text: string): Promise<string>;
}
