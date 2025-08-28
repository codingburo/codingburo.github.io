interface ChatInteraction {
  id: string;
  chatId: string;
  uid: string;
  reaction: 'like' | 'dislike' | null;
  timestamp: Date;
  isActive: boolean; 
}
