// models/ChatShare.ts - Track individual shares
interface ChatShare {
  id: string;
  chatId: string;
  shareToken: string;
  platform: 'copy' | 'twitter' | 'linkedin' | 'reddit';
  sharedBy: string;
  sharedAt: Date;
  viewCount: number;
}
