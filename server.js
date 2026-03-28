import express from 'express';
import cors from 'cors';
import axios from 'axios';
import fs from 'fs';
import os from 'os';
import path from 'path';
import OpenAI from 'openai';

const app = express();
const port = process.env.PORT || 3000;

if (!process.env.OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY is not set. The /api/transcribe endpoint will fail until you define it.');
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, message: 'Local transcription backend is running.' });
});

function safeFileNameFromUrl(audioUrl) {
  const clean = audioUrl.split('?')[0];
  const base = path.basename(clean) || 'audio.mp3';
  return base.replace(/[^a-zA-Z0-9._-]/g, '_');
}

app.post('/api/transcribe', async (req, res) => {
  const { audioUrl, model = 'gpt-4o-mini-transcribe', language } = req.body || {};

  if (!audioUrl || typeof audioUrl !== 'string') {
    return res.status(400).json({ error: 'audioUrl is required.' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is missing in the server environment.' });
  }

  const tempPath = path.join(os.tmpdir(), `${Date.now()}-${safeFileNameFromUrl(audioUrl)}`);

  try {
    const response = await axios({
      method: 'get',
      url: audioUrl,
      responseType: 'stream',
      timeout: 1000 * 60 * 2,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 Audio Transcriber Local Tool'
      }
    });

    const writer = fs.createWriteStream(tempPath);
    await new Promise((resolve, reject) => {
      response.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempPath),
      model,
      ...(language ? { language } : {})
    });

    const stat = fs.statSync(tempPath);

    res.json({
      text: transcription.text || '',
      model,
      bytesDownloaded: stat.size,
      sourceUrl: audioUrl
    });
  } catch (error) {
    const details = error?.response?.data || error?.message || 'Unknown error';
    res.status(500).json({ error: typeof details === 'string' ? details : JSON.stringify(details) });
  } finally {
    try {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    } catch {
      // ignore cleanup errors
    }
  }
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
