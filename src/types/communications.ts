export interface AdminCommunication {
  id: string;
  title: string;
  message: string;
  created_by: string;
  created_at: string;
  expires_at?: string;
  target_roles: string[];
  is_active: boolean;
  priority: 'low' | 'medium' | 'high';
  dismissible: boolean;
  updated_at?: string;
}

export interface AdminCommunicationCreate {
  title: string;
  message: string;
  target_roles: string[];
  expires_at?: string;
  priority: 'low' | 'medium' | 'high';
  dismissible: boolean;
}

export interface AdminCommunicationUpdate {
  title?: string;
  message?: string;
  target_roles?: string[];
  expires_at?: string;
  priority?: 'low' | 'medium' | 'high';
  dismissible?: boolean;
  is_active?: boolean;
}

export interface UserDismissedCommunication {
  id: string;
  user_id: string;
  communication_id: string;
  dismissed_at: string;
} 