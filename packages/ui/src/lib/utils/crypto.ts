import EC from 'elliptic';

export const sha256 = async (data: string): Promise<string> => {
  const arraybuf = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', arraybuf);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const signWithP256 = (base64PrivateKey: string, data: string) => {
  const buff = base64ToArrayBuffer(base64PrivateKey);
  const hex = Buffer.from(buff).toString('hex');
  const ec = new EC.ec('p256');
  const key = ec.keyFromPrivate(hex);
  const msgHash = Buffer.from(data, 'utf-8').toString('hex');
  const signature = key.sign(msgHash);
  return Buffer.from(signature.toDER()).toString('hex');
};

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary_string = window.atob(base64.replace(/_/g, '/').replace(/-/g, '+'));
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

export const generateECDHKeyPairFromhex = async (
  hashHex: string
): Promise<{ pub: string; priv: string }> => {
  const ec = new EC.ec('curve25519');
  const key = ec.keyFromPrivate(hashHex);
  const pubhex = key.getPublic().encodeCompressed('hex');
  const privhex = key.getPrivate().toString('hex');

  return {
    priv: privhex,
    pub: pubhex,
  };
};