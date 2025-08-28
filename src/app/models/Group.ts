// models/Group.ts - For group sharing
interface Group {
  id: string;
  chatId: string;
  members: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
