export interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters?: string[]; // Only used for non-anonymous polls
}

export interface Poll {
  id?: string;
  question: string;
  options: PollOption[];
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
  isAnonymous: boolean; // New field to indicate if the poll is anonymous
  totalVotes?: number;
}