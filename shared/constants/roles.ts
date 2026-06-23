export const USER_ROLES = {
  NORMAL: 0,
  ADMIN: 1,
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
