export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  password?: string;
  banned?: boolean;
  isAdmin?: boolean; // <-- Add this line
}