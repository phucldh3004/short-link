export interface AccessLog {
  id?: string;
  shortlinkId: string;
  ipAddress: string;
  userAgent?: string;
  referer?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
  region?: string;
  timezone?: string;
  timestamp?: Date;
}
