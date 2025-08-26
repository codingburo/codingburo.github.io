interface Chat {
  id: string;
  sessionId: string;
  email: string;
  prompt: string;
  response: string;
  provider: string;
  create_at: Date;
}
