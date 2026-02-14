/**
 * Generates a random alphanumeric invite code
 * @param length Length of the code (default: 8)
 * @returns Uppercase alphanumeric string
 */
export const generateInviteCode = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
};

/**
 * Generates a unique invite code with timestamp prefix
 * @returns Invite code format: XXX-XXXXXXXX
 */
export const generateUniqueInviteCode = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase().slice(-3);
  const random = generateInviteCode(5);
  return `${timestamp}-${random}`;
};
