export interface ProfileDTO {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  role: "USER" | "ADMIN";
  balance: number;
  level: number;
  xp: number;
  referralCode: string;
  isBanned: boolean;
  createdAt: string;
}
