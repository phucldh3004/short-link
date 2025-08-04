export interface Shortlink {
  id?: string;
  code: string;
  targetUrl: string;
  clicks: number;
  isActive: boolean;
  expiresAt?: Date | null;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}
