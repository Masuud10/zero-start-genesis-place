
export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetAudience: 'all' | 'parents' | 'teachers' | 'students';
  createdBy: string;
  createdAt: Date;
  expiryDate?: Date;
  attachments?: string[];
  readBy: string[];
  schoolId?: string;
  isGlobal: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  attachments?: string[];
  conversationId: string;
  senderName?: string;
  receiverName?: string;
}

export interface SupportTicket {
  id: string;
  schoolId: string;
  createdBy: string;
  title: string;
  description: string;
  type: 'technical' | 'feature_request' | 'billing' | 'feedback';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  resolvedAt?: Date;
  assignedTo?: string;
  attachments?: string[];
}

export interface Conversation {
  id: string;
  name: string;
  role: string;
  lastMessage?: Message;
  unreadCount?: number;
}
