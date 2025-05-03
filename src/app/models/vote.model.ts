export interface Vote {
  id?: string;
  pollId: string;
  userId: string;
  optionId: string;
  createdAt: Date;
  userDisplayName?: string; 
}