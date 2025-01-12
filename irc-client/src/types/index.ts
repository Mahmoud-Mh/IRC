export interface Message {
    sender: string;
    content: string;
    channel: string;
    timestamp: Date;
  }
  
  export interface Channel {
    name: string;
    users: string[];
  }
  