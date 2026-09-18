/**
 * Extract the first OTP (4–8 character alphanumeric code) from an email body.
 * Supports both numeric (e.g., "123456") and alphanumeric (e.g., "8c8ee0") codes.
 * Returns null if none found.
 */
export function extractOtp(text: string): string | null {
  const match = text.match(/\b([a-zA-Z0-9]{4,8})\b/);
  return match ? match[1] : null;
}
