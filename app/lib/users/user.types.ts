export interface AdminUserListOptions {
  query?: string;
  page?: number;
  limit?: number;
}

export interface AdminUserUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string | null;
  role?: "CUSTOMER" | "ADMIN";
}