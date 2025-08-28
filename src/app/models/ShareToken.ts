// models/ShareToken.ts - For shareable URLs
interface ShareToken {
  id: string;
  chatId: string;
  token: string;
  createdBy: string;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}
