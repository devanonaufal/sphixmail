/**
 * Hash a password using Web Crypto API (SHA-256).
 * For stronger security, consider PBKDF2 below.
 * ponytail: using SHA-256 for simplicity; upgrade to PBKDF2 if brute-force is a concern.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return (await hashPassword(password)) === hash;
}
