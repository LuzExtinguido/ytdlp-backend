import { Test, TestingModule } from '@nestjs/testing';
import { DownloadsController } from './downloads.controller';
import { DownloadsService } from './downloads.service';

describe('DownloadsController', () => {
  let controller: DownloadsController;
  const downloadsService = {
    download: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DownloadsController],
      providers: [
        {
          provide: DownloadsService,
          useValue: downloadsService,
        },
      ],
    }).compile();

    controller = module.get<DownloadsController>(DownloadsController);
    downloadsService.download.mockReset();
  });

  it('passes the download request to the service', async () => {
    const dto = { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' };
    const response = {
      status: 'done',
      filename: 'video.mp4',
      message: 'Download completed successfully.',
    };
    downloadsService.download.mockResolvedValue(response);

    await expect(controller.download(dto)).resolves.toEqual(response);
    expect(downloadsService.download).toHaveBeenCalledWith(dto);
  });
});
