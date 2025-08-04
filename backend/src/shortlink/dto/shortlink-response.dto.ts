export class ShortlinkResponseDto {
  id: number;
  code: string;
  originalUrl: string;
  shortUrl: string;
  clicks: number;
  createdAt: Date;
}
