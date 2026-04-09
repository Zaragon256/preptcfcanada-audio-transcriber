# Audio URL Transcriber

This local tool has 2 parts:

- `index.html`: a lightweight frontend with a landing page, current-run workspace, saved JSON browser, and backend status checks
- `server.js`: a Node.js backend that downloads remote audio, sends it to OpenAI transcription, and stores generated JSON runs locally

The Node app can also serve `index.html` directly, which makes deployment behind Caddy simpler.

## 1) Install dependencies

```bash
npm install
```

## 2) Set your API key

### Windows PowerShell

```powershell
$env:OPENAI_API_KEY="your-api-key-here"
```

### Windows CMD

```cmd
set OPENAI_API_KEY=your-api-key-here
```

## 3) Start the backend

```bash
npm start
```

The backend will run on:

```text
http://localhost:3000
```

## 4) Open the HTML page

Open `index.html` in your browser.

You can also run the backend and open:

```text
http://localhost:3000
```

In that mode, Express serves the frontend directly.

## Flow

1. Open the landing page and verify backend status
2. Go to **Current run**
3. Paste the raw HTML or load a sample from `resources`
4. Click **Extract audio URLs**
5. Click **Check backend**
6. Click **Transcribe** on one item or **Transcribe all**
7. Click **Save JSON to backend** to persist the run
8. Open **Saved JSONs** to review previous executions

## Notes

- The browser page does **not** call OpenAI directly.
- That is intentional, so your API key stays on your machine and is not exposed in the HTML.
- Models commonly used for this are `gpt-4o-mini-transcribe` or `gpt-4o-transcribe`.
- Generated runs are stored under `data/runs`.
- Example files remain under `resources` and are also visible in the saved-runs browser.

## Docker deployment

This project includes:

- `Dockerfile`
- `compose.yaml`
- `docker-compose.yml`

If you want to mirror your existing `tcf-flashcards` layout, use `compose.yaml` and deploy the project under:

```text
/srv/apps/preptcf-audio-transcriber
```

The default setup runs the app on:

```text
127.0.0.1:3002 -> container port 3000
```

That avoids conflicts with your existing services on ports `3000` and `3001`.

### Recommended server structure

```text
/srv/apps/preptcf-audio-transcriber/
├── .env
├── compose.yaml
├── Dockerfile
├── index.html
├── package.json
├── package-lock.json
├── server.js
├── resources/
└── data/
```

### 1) Copy the project to the server

Example:

```bash
sudo mkdir -p /srv/apps/preptcf-audio-transcriber
sudo chown -R $USER:$USER /srv/apps/preptcf-audio-transcriber
```

Then copy the repository contents into that folder.

### 2) Create the environment file

Create `/srv/apps/preptcf-audio-transcriber/.env`:

```env
OPENAI_API_KEY=your-api-key-here
```

If you prefer, you can add more variables later, but this is the only required one for now.

### 3) Create the persistent data folder

```bash
mkdir -p /srv/apps/preptcf-audio-transcriber/data/runs
```

Generated JSON runs are persisted through this volume mapping:

```text
./data:/app/data
```

So saved runs survive container restarts and rebuilds.

### 4) Start the container

```bash
cd /srv/apps/preptcf-audio-transcriber
docker compose up -d --build
```

### 5) Verify the container is running

```bash
docker compose ps
docker compose logs -f
```

You should then be able to reach the app locally at:

```text
http://127.0.0.1:3002
```

And the health endpoint at:

```text
http://127.0.0.1:3002/health
```

### 6) Configure Caddy

Example Caddy site block:

```caddy
audio.yourdomain.com {
    reverse_proxy 127.0.0.1:3002
}
```

The frontend auto-detects the current origin when served over HTTP/HTTPS, so it will use the same public domain for `/health` and `/api/*`.

### 7) Reload Caddy

Depending on your setup, one of these is usually enough:

```bash
sudo systemctl reload caddy
```

or:

```bash
sudo caddy reload --config /etc/caddy/Caddyfile
```

### 8) Update flow

When you deploy new changes:

```bash
cd /srv/apps/preptcf-audio-transcriber
docker compose up -d --build
docker compose logs -f
```

## Linux server checklist

- Docker and Docker Compose plugin installed
- Caddy installed and running
- DNS pointed at the server for the chosen domain
- `/srv/apps/preptcf-audio-transcriber/.env` present with `OPENAI_API_KEY`
- Port `3002` free on the host
- Outbound internet access enabled for the container so it can:
  - download remote MP3 files
  - call OpenAI transcription APIs

## Useful commands

From `/srv/apps/preptcf-audio-transcriber`:

```bash
docker compose ps
docker compose logs -f
docker compose up -d --build
docker compose down
```
