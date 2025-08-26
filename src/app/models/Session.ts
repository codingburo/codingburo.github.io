// models/Session.ts
interface Session {
  id: string;
  uid: string;
  title: string;
  subtitle?: string;
  createdAt: Date;
  updatedAt: Date;
}
