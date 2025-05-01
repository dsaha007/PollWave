export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id?: string;
  question: string;
  options: PollOption[];
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
  totalVotes?: number;
}