// セキュリティ強度
const ITERATIONS = 100000;
const HASH_ALGORITHM = 'SHA-256';
const KEY_LENGTH = 32; // 256 bits (32 bytes)

/**
 * バイナリデータ(ArrayBuffer)を16進数の文字列に変換するヘルパー
 */
function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * 16進数の文字列をバイナリデータ(Uint8Array)に変換するヘルパー
 */
function hexToBuffer(hex: string): Uint8Array {
  const match = hex.match(/[\da-f]{2}/gi);
  if (!match) return new Uint8Array();
  return new Uint8Array(match.map((h) => parseInt(h, 16)));
}

/**
 * 新規パスワードをハッシュ化する関数
 * 戻り値の形式: "ソルトの16進数:ハッシュの16進数"
 */
export async function hashPassword(password: string): Promise<string> {
  // 1. 16バイトのランダムなソルト（味付け）を生成
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // 2. パスワードの文字列をWeb Crypto API用の「鍵素材」に変換
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );

  // 3. PBKDF2アルゴリズムで10万回計算してハッシュ値を生成
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: ITERATIONS,
      hash: HASH_ALGORITHM,
    },
    keyMaterial,
    KEY_LENGTH * 8, // 必要なビット数
  );

  // 4. DBに保存しやすいよう、ソルトとハッシュを「:」で繋いだ文字列にして返す
  return `${bufferToHex(salt)}:${bufferToHex(derivedBits)}`;
}

/**
 * ログイン時に入力されたパスワードが正しいか検証する関数
 */
export async function verifyPassword(password: string, storedHashString: string): Promise<boolean> {
  // DBに保存されている文字列を「ソルト」と「ハッシュ」に分解
  const [saltHex, originalHashHex] = storedHashString.split(':');
  if (!saltHex || !originalHashHex) return false;

  const salt = hexToBuffer(saltHex);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );

  // 保存されていたソルトを使って、入力されたパスワードを同じ条件でハッシュ化
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      // biome-ignore lint/suspicious/noExplicitAny: Web Crypto APIの型定義（ArrayBuffer）と実行環境（Uint8Array）のミスマッチを回避するため
      salt: salt as any,
      iterations: ITERATIONS,
      hash: HASH_ALGORITHM,
    },
    keyMaterial,
    KEY_LENGTH * 8,
  );

  // 計算結果が保存されていたハッシュと一致すれば正解
  return bufferToHex(derivedBits) === originalHashHex;
}
