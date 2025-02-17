function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
}

function validatePassword(password: string): boolean {
  return password.length >= 6;
}

export const validators = {
  validateEmail,
  validatePassword,
};
