import { BadRequestException } from '@nestjs/common';
import { DownloadsService } from './downloads.service';

type TestableDownloadsService = DownloadsService & {
  buildYtDlpArgs(
    downloadType: 'audio' | 'video',
    outputTemplate: string,
    url: string,
  ): string[];
};

describe('DownloadsService', () => {
  it('rejects missing urls', async () => {
    const service = new DownloadsService();

    await expect(service.download({ url: '   ' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('builds video downloads as merged mp4 at 720p or lower', () => {
    const service = new DownloadsService() as TestableDownloadsService;

    expect(
      service.buildYtDlpArgs('video', 'downloads/%(title)s.%(ext)s', 'URL'),
    ).toEqual([
      '--no-playlist',
      '--restrict-filenames',
      '--print',
      'after_move:filepath',
      '-o',
      'downloads/%(title)s.%(ext)s',
      '-f',
      'bestvideo[height<=720]+bestaudio/best[height<=720]',
      '--merge-output-format',
      'mp4',
      'URL',
    ]);
  });

  it('builds audio downloads as m4a with thumbnail and metadata', () => {
    const service = new DownloadsService() as TestableDownloadsService;

    expect(
      service.buildYtDlpArgs('audio', 'downloads/%(title)s.%(ext)s', 'URL'),
    ).toEqual([
      '--no-playlist',
      '--restrict-filenames',
      '--print',
      'after_move:filepath',
      '-o',
      'downloads/%(title)s.%(ext)s',
      '-f',
      'ba',
      '-x',
      '--audio-format',
      'm4a',
      '--embed-thumbnail',
      '--add-metadata',
      'URL',
    ]);
  });
});
