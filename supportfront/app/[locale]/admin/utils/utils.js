import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function truncateText(text, maxLength = 100) {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}

export const permissionsList = [
  "create_admin",
  "create_role",
  "update_role",
  "delete_role",
  "delete_users",
  "view_users",
  "update_users",
  "view_admins",
  "update_admin",
  "delete_admin",
  "get_roles",
  "blog_editor",
  "application_editor",
  "user_response",
  "needs_manager",
  "event_editor",
  "donation_editor",
];
