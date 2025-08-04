export interface ShortlinkPassword {
  id?: string;
  shortlinkId: string;
  password: string; // hashed
  startTime?: Date | null;
  endTime?: Date | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
