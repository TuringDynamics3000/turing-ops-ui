export type Role =
  | "OPERATOR"
  | "SUPERVISOR"
  | "COMPLIANCE"
  | "PLATFORM_ADMIN";

export interface User {
  id: string;
  name: string;
  role: Role;
  avatarUrl?: string;
}

// Mock current user for now - default to SUPERVISOR to show most features
const MOCK_USER: User = {
  id: "u-123",
  name: "Alex Chen",
  role: "SUPERVISOR",
  avatarUrl: "https://github.com/shadcn.png",
};

export function getCurrentUser(): User {
  return MOCK_USER;
}
