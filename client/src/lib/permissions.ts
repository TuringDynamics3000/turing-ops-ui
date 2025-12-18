import { getCurrentUser } from "./auth";
import { Decision } from "./decisions";

export function canApprove(decision: Decision): boolean {
  const user = getCurrentUser();

  if (decision.requiredAuthority === "SUPERVISOR") {
    return user.role === "SUPERVISOR" || user.role === "PLATFORM_ADMIN";
  }

  if (decision.requiredAuthority === "COMPLIANCE") {
    return user.role === "COMPLIANCE" || user.role === "PLATFORM_ADMIN";
  }

  if (decision.requiredAuthority === "DUAL") {
    return false; // dual handled server-side / requires multi-step
  }

  return false;
}

export function canViewSection(section: string): boolean {
  const user = getCurrentUser();
  
  switch (section) {
    case "config":
      return user.role === "PLATFORM_ADMIN";
    case "evidence":
      return ["SUPERVISOR", "COMPLIANCE", "PLATFORM_ADMIN"].includes(user.role);
    case "risk":
      return ["COMPLIANCE", "PLATFORM_ADMIN"].includes(user.role);
    default:
      return true;
  }
}
