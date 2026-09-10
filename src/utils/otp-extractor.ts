/**
 * Extract the first OTP (4–8 digit number) from an email body.
 * Returns null if none found.
 */
export function extractOtp(text: string): string | null {
  const match = text.match(/\b(\d{4,8})\b/);
  return match ? match[1] : null;
}
