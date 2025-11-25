import { User } from "./users";

export type PagePermission =
  | "view_dashboard"
  | "view_upload"
  | "view_insights"
  | "view_settings"
  | "view_billing"
  | "manage_users";

const ROLE_PERMISSIONS: Record<User["role"], PagePermission[]> = {
  owner: [
    "view_dashboard",
    "view_upload",
    "view_insights",
    "view_settings",
    "view_billing",
    "manage_users"
  ],
  editor: [
    "view_dashboard",
    "view_upload",
    "view_insights"
  ],
  viewer: [
    "view_dashboard",
    "view_insights"
  ]
};

export function hasPermission(user: User, perm: PagePermission): boolean {
  return ROLE_PERMISSIONS[user.role].includes(perm);
}
