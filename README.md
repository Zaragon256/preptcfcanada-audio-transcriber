# Audio URL Transcriber

This small local tool has 2 parts:

- `index.html`: standalone browser page that extracts audio URLs from pasted HTML and calls your local backend with **axios**
- `server.js`: Node.js backend that downloads the remote audio and sends it to OpenAI transcription

## 1) Install dependencies

```bash
npm install
```

## 2) Set your API key

### Windows PowerShell

```powershell
$env:OPENAI_API_KEY="PASTE_YOUR_KEY_HERE"
```

### Windows CMD

```cmd
set OPENAI_API_KEY=PASTE_YOUR_KEY_HERE
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

## Flow

1. Paste the raw HTML/audio tags
2. Click **Extract audio URLs**
3. Click **Check backend**
4. Click **Transcribe** on one item or **Transcribe all**

## Notes

- The browser page does **not** call OpenAI directly.
- That is intentional, so your API key stays on your machine and is not exposed in the HTML.
- Models commonly used for this are `gpt-4o-mini-transcribe` or `gpt-4o-transcribe`.
