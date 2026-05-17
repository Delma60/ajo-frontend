export type NotificationKind = 'reminder' | 'credit' | 'alert' | 'info' | 'success' | 'invite' | 'system' | string;

export interface INotificationPayload {
  title?: string;
  body?: string;
  // optional structured data your backend may include (groupId, transactionId, url)
  link?: string | null;
  group_id?: number | null;
  transaction_id?: number | null;
  extra?: Record<string, any>;
}

export interface INotification {
  id: string;                 // uuid from notifications table
  type: NotificationKind;     // category/type (mirrors payload.kind or notification class)
  title: string;
  body: string;
  read:boolean;
  data: INotificationPayload; // payload stored in DB notification.data
  readAt: string | null;      // when read (ISO) - maps to read_at
  createdAt: string;          // created_at ISO
}

