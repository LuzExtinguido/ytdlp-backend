# ytdlp-backend

Local NestJS backend for a yt-dlp powered downloader app.

## API

### `POST /downloads`

Request:

```json
{
  "url": "https://www.youtube.com/watch?v=example",
  "type": "video"
}
```

`type` can be `video` or `audio`. If omitted, the backend downloads video.

Success response:

```json
{
  "status": "done",
  "filename": "example.mp4",
  "message": "Download completed successfully."
}
```

The backend saves completed files into `downloads/` and enables CORS for
`http://localhost:5173`.

Video downloads use:

```bash
yt-dlp -f "bestvideo[height<=720]+bestaudio/best[height<=720]" --merge-output-format mp4 URL
```

Audio downloads use:

```bash
yt-dlp -f ba -x --audio-format m4a --embed-thumbnail --add-metadata URL
```

## Requirements

- Node.js
- `yt-dlp` available on PATH
- `ffmpeg` available to `yt-dlp` for merge/conversion workflows

## Commands

```bash
npm install
npm run start:dev
npm test -- --runInBand
npm run build
```
