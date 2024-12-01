export interface Message {
  id: string;
  text: string;
  userId: string;
  username: string;
  timestamp: number;
}

export interface User {
  id: string;
  username: string;
  balance: number;
  roomId: string;
}

export interface Room {
  id: string;
  users: User[];
}