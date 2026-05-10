import { Module } from '@nestjs/common';
import { DownloadsModule } from './downloads/downloads.module';

@Module({
  imports: [DownloadsModule],
})
export class AppModule {}
