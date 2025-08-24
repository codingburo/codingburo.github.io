interface Chat {
  id: string;
  sessionId: number;
  email: string;
  prompt: string;
  response: string;
  provider: string;
  create_at: Date;
}
