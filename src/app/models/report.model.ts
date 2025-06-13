export interface Report {
  id?: string;
  pollId: string;
  reportedBy: string;
  reason: string;
  createdAt: Date;
}