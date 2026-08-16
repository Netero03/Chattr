export const normalizeSignupData = ({ fullName, email, password }) => ({
  fullName: fullName.trim(),
  email: email.trim().toLowerCase(),
  password,
});

export const normalizeLoginData = ({ email, password }) => ({
  email: email.trim().toLowerCase(),
  password,
});