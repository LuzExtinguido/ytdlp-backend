export class CreateDownloadDto {
  url?: string;
  type?: 'audio' | 'video';
  format?: 'audio' | 'video';
}
