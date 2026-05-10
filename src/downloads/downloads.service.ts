import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { CreateDownloadDto } from './dto/create-download.dto';

type DownloadResult = {
  status: 'done';
  filename: string;
  message: string;
};

type DownloadType = 'audio' | 'video';

@Injectable()
export class DownloadsService {
  private readonly downloadsPath = join(process.cwd(), 'downloads');

  async download(createDownloadDto: CreateDownloadDto): Promise<DownloadResult> {
    const url = createDownloadDto.url?.trim();

    if (!url) {
      throw new BadRequestException('A non-empty url is required.');
    }

    await mkdir(this.downloadsPath, { recursive: true });

    const outputTemplate = join(
      this.downloadsPath,
      '%(title).200B [%(id)s].%(ext)s',
    );
    const downloadType = this.getDownloadType(createDownloadDto);
    const args = this.buildYtDlpArgs(downloadType, outputTemplate, url);

    const result = await this.runYtDlp(args);
    const filepath = result.stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .at(-1);

    return {
      status: 'done',
      filename: filepath ? basename(filepath) : 'downloaded-file',
      message: 'Download completed successfully.',
    };
  }

  private getDownloadType(createDownloadDto: CreateDownloadDto): DownloadType {
    const requestedType = createDownloadDto.type ?? createDownloadDto.format;

    if (!requestedType) {
      return 'video';
    }

    if (requestedType !== 'audio' && requestedType !== 'video') {
      throw new BadRequestException('Download type must be audio or video.');
    }

    return requestedType;
  }

  buildYtDlpArgs(
    downloadType: DownloadType,
    outputTemplate: string,
    url: string,
  ): string[] {
    const sharedArgs = [
      '--no-playlist',
      '--restrict-filenames',
      '--print',
      'after_move:filepath',
      '-o',
      outputTemplate,
    ];

    if (downloadType === 'audio') {
      return [
        ...sharedArgs,
        '-f',
        'ba',
        '-x',
        '--audio-format',
        'm4a',
        '--embed-thumbnail',
        '--add-metadata',
        url,
      ];
    }

    return [
      ...sharedArgs,
      '-f',
      'bestvideo[height<=720]+bestaudio/best[height<=720]',
      '--merge-output-format',
      'mp4',
      url,
    ];
  }

  private runYtDlp(args: string[]): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const child = spawn('yt-dlp', args, {
        windowsHide: true,
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (chunk: Buffer) => {
        stdout += chunk.toString();
      });

      child.stderr.on('data', (chunk: Buffer) => {
        stderr += chunk.toString();
      });

      child.on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'ENOENT') {
          reject(
            new InternalServerErrorException(
              'yt-dlp is not installed or is not available on PATH.',
            ),
          );
          return;
        }

        reject(
          new InternalServerErrorException(
            `Failed to start yt-dlp: ${error.message}`,
          ),
        );
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
          return;
        }

        reject(
          new InternalServerErrorException(
            stderr.trim() || `yt-dlp exited with code ${code}.`,
          ),
        );
      });
    });
  }
}
