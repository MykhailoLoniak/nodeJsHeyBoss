type UserRole = "customer" | "contractor" | "admin";

export interface UserRegist {
  id: symbol;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  role: UserRole;
  avatarUrl?: string;
  dateOfBirth?: Date;
  activationToken: string | null;
}
