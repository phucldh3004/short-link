export interface ShortlinkSchedule {
  id?: string;
  shortlinkId: string;
  targetUrl: string;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
