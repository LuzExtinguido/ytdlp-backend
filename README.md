# ytdlp-backend

Local NestJS backend for a yt-dlp powered downloader app.

## API

### `POST /downloads`

Request:

```json
{
  "url": "https://www.youtube.com/watch?v=example"
}
```

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
