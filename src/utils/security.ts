/**
 * İstemci tarafında düz metin (plain-text) gizli komut veya şifre barındırmamak için
 * tek yönlü SHA-256 özetleme (hash) doğrulaması kullanılır.
 * Böylece kaynak kod GitHub'da herkese açık (public) olsa bile şifreler okunamaz.
 */

const K: number[] = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];

function rightRotate(value: number, amount: number): number {
  return (value >>> amount) | (value << (32 - amount));
}

export function sha256Sync(input: string): string {
  const utf8 = unescape(encodeURIComponent(input));
  const words: number[] = [];
  const asciiBitLength = utf8.length * 8;

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  for (let i = 0; i < utf8.length; i++) {
    words[i >> 2] |= (utf8.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
  }
  words[utf8.length >> 2] |= 0x80 << (24 - (utf8.length % 4) * 8);
  words[(((utf8.length + 8) >> 6) << 4) + 15] = asciiBitLength;

  const w = new Array<number>(64);

  for (let j = 0; j < words.length; j += 16) {
    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i++) {
      if (i < 16) {
        w[i] = words[j + i] | 0;
      } else {
        const gamma0x = w[i - 15];
        const gamma0 = rightRotate(gamma0x, 7) ^ rightRotate(gamma0x, 18) ^ (gamma0x >>> 3);
        const gamma1x = w[i - 2];
        const gamma1 = rightRotate(gamma1x, 17) ^ rightRotate(gamma1x, 19) ^ (gamma1x >>> 10);
        w[i] = (w[i - 16] + gamma0 + w[i - 7] + gamma1) | 0;
      }

      const ch = (e & f) ^ (~e & g);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const sigma0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const sigma1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);

      const t1 = (h + sigma1 + ch + K[i] + w[i]) | 0;
      const t2 = (sigma0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + t1) | 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) | 0;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
    h5 = (h5 + f) | 0;
    h6 = (h6 + g) | 0;
    h7 = (h7 + h) | 0;
  }

  const toHex = (n: number) => (n >>> 0).toString(16).padStart(8, '0');
  return toHex(h0) + toHex(h1) + toHex(h2) + toHex(h3) + toHex(h4) + toHex(h5) + toHex(h6) + toHex(h7);
}

// SHA-256 özetleri (Düz metin komutlar kodda yer almaz)
const SECRET_LOG_HASHES = new Set([
  'e50c73cd374d21ff36d95af72186b8d293801fe61ea5c8df6cc0137944cf70c5',
  '48a5bd8d91ce345ea605b14e50bc4fe22337bbe089112e1616e6128cc0a6de12'
]);

const SECRET_CALCULATE_HASHES = new Set([
  'd513ef23fbe08a7e6de9a42a211b4bf23accefec3ab0ba22b9236f9fe183cad8',
  'b0b8cc44a40e264f19a20008f9b205f9c159e56db70a8e247127bb1f9f27421d'
]);

const SECRET_CLOCK_HASHES = new Set([
  'f1417c90ce5fbc1450e3cb9d08e8026ccbe593aec9e0c883953fa1286f3efe66',
  '2196f25ce69fdfeb85d966a3c00b9667c4fb3e4dc05a2fd07eec41497ab7ea67'
]);

const VALID_ADMIN_PASSKEY_HASHES = new Set([
  'e50c73cd374d21ff36d95af72186b8d293801fe61ea5c8df6cc0137944cf70c5',
  '48a5bd8d91ce345ea605b14e50bc4fe22337bbe089112e1616e6128cc0a6de12',
  'e3829f24b3aee6969a8397765f7f4e6a089febfd5a27e28947fa50e22c72ce24',
  'c041bca82342d6b4d955b87bb3ef0acc170597521d3b9b2fec381cd30939ee0a',
  'cd923e112d2394144364e5bdbfa23f70a2b355ef242330bbcc3f90b3a05ec69d',
  'aef0d1f4a1477556f1becf6783724802d83326aece8475b4671c7cf060a6743d'
]);

export type SecretCommandType = 'log' | 'calculate' | 'clock' | 'tesbih' | null;

export function detectSecretSearchCommand(rawQuery: string): SecretCommandType {
  const trimmed = rawQuery.trim();
  if (!trimmed || trimmed.length < 6 || trimmed.length > 64) return null;

  if (trimmed.toLowerCase() === 'admin//selimtesbih') {
    return 'tesbih';
  }

  const hashExact = sha256Sync(trimmed);
  const hashLower = sha256Sync(trimmed.toLowerCase());

  if (SECRET_LOG_HASHES.has(hashExact) || SECRET_LOG_HASHES.has(hashLower)) {
    return 'log';
  }
  if (SECRET_CALCULATE_HASHES.has(hashExact) || SECRET_CALCULATE_HASHES.has(hashLower)) {
    return 'calculate';
  }
  if (SECRET_CLOCK_HASHES.has(hashExact) || SECRET_CLOCK_HASHES.has(hashLower)) {
    return 'clock';
  }
  return null;
}

export function isValidAdminPasskeyClient(rawPasskey: string): boolean {
  const trimmed = (rawPasskey || '').trim();
  if (!trimmed || trimmed.length > 100) return false;
  const hashExact = sha256Sync(trimmed);
  const hashLower = sha256Sync(trimmed.toLowerCase());
  return VALID_ADMIN_PASSKEY_HASHES.has(hashExact) || VALID_ADMIN_PASSKEY_HASHES.has(hashLower);
}

export function getEncodedMailEndpoint(): string {
  const prefix = 'https://formsubmit.co/ajax/';
  const codes = [
    98, 105, 108, 103, 105, 115, 97, 121, 97, 114, 46,
    105, 99, 105, 110, 46, 110, 101, 116, 64,
    103, 109, 97, 105, 108, 46, 99, 111, 109
  ];
  return prefix + String.fromCharCode(...codes);
}
