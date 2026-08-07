export interface IDevPanelProvider {
  children: JSX.Element;
}

export interface ILoginHistory {
  id: string;
  user_id: string;
  email: string;
  name: string;
  ip_address: string | null;
  created_at: string;
}

export interface IUserMetric {
  id: string;
  name: string;
  email: string;
  last_login: string | null;
  logins_this_month: number;
}

export type AuditAction = "INSERT" | "UPDATE" | "REMOVE";

export interface IAuditLog {
  id: string;
  user_id: string | null;
  user_email: string;
  user_name: string;
  action: AuditAction;
  entity_name: string;
  entity_id: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  created_at: string;
}

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
}

export interface IOnlineUser {
  user_id: string;
  email: string;
  name: string;
  last_seen_at: string;
}

export interface ILoginHistoryFilters {
  email?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface IAuditLogFilters {
  entity_name?: string;
  user_email?: string;
  action?: AuditAction;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface IDevPanelContext {
  getLoginHistory: (
    filters?: ILoginHistoryFilters
  ) => Promise<IPaginatedResponse<ILoginHistory>>;
  getUserMetrics: () => Promise<IUserMetric[]>;
  getAuditLog: (
    filters?: IAuditLogFilters
  ) => Promise<IPaginatedResponse<IAuditLog>>;
  getOnlineUsers: () => Promise<IOnlineUser[]>;
}
