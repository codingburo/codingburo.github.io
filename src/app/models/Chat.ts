interface Chat {
  id: string;
  sessionId: string;
  email: string;
  prompt: string;
  response: string;
  provider: string;
  create_at: Date;
  interactions?: {
    likes: number;
    dislikes: number;
    shares: number;
    copies: number;
    retries: number;
    views: number;
  };
  visibility: 'private' | 'public' | 'shared';
}
