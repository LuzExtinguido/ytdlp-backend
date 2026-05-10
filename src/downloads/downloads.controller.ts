import { Body, Controller, Post } from '@nestjs/common';
import { CreateDownloadDto } from './dto/create-download.dto';
import { DownloadsService } from './downloads.service';

@Controller('downloads')
export class DownloadsController {
  constructor(private readonly downloadsService: DownloadsService) {}

  @Post()
  download(@Body() createDownloadDto: CreateDownloadDto) {
    return this.downloadsService.download(createDownloadDto);
  }
}
