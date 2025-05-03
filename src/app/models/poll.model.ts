export interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters?: string[]; 
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