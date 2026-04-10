import express from 'express';
import cors from 'cors';
import axios from 'axios';
import fs from 'fs';
import os from 'os';
import path from 'path';
import OpenAI from 'openai';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const resourcesDir = path.join(__dirname, 'resources');
const runsDir = path.join(__dirname, 'data', 'runs');

if (!process.env.OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY is not set. The /api/transcribe endpoint will fail until you define it.');
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

fs.mkdirSync(runsDir, { recursive: true });

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use('/resources', express.static(resourcesDir));
app.use(express.static(__dirname));

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    message: 'Local transcription backend is running.',
    apiKeyConfigured: Boolean(process.env.OPENAI_API_KEY),
    storage: {
      runsDir
    }
  });
});

function safeFileNameFromUrl(audioUrl) {
  const clean = audioUrl.split('?')[0];
  const base = path.basename(clean) || 'audio.mp3';
  return base.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function safeSlug(value, fallback = 'run') {
  return String(value || fallback)
    .normalize('NFKD')
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || fallback;
}

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function buildRunSummary(filePath, source) {
  const raw = readJsonFile(filePath);
  const stats = fs.statSync(filePath);
  const items = Array.isArray(raw) ? raw : raw.items || [];
  const title = Array.isArray(raw)
    ? path.basename(filePath, '.json')
    : raw.name || raw.title || path.basename(filePath, '.json');
  const createdAt = Array.isArray(raw)
    ? stats.mtime.toISOString()
    : raw.createdAt || raw.savedAt || stats.mtime.toISOString();

  return {
    id: path.basename(filePath),
    name: title,
    createdAt,
    audioCount: items.length,
    source,
    fileName: path.basename(filePath)
  };
}

function loadRunByFile(filePath, source) {
  const raw = readJsonFile(filePath);
  if (Array.isArray(raw)) {
    return {
      id: path.basename(filePath),
      name: path.basename(filePath, '.json'),
      createdAt: fs.statSync(filePath).mtime.toISOString(),
      source,
      items: raw
    };
  }

  return {
    id: path.basename(filePath),
    source,
    ...raw
  };
}

function resolveStoredRun(fileName) {
  const safeName = path.basename(fileName);
  const generatedPath = path.join(runsDir, safeName);
  const examplePath = path.join(resourcesDir, safeName);

  if (fs.existsSync(generatedPath)) {
    return { path: generatedPath, source: 'generated' };
  }

  if (fs.existsSync(examplePath)) {
    return { path: examplePath, source: 'example' };
  }

  return null;
}

function resolveGeneratedRun(fileName) {
  const safeName = path.basename(fileName);
  const generatedPath = path.join(runsDir, safeName);

  if (fs.existsSync(generatedPath)) {
    return generatedPath;
  }

  return null;
}

app.get('/api/examples', (_req, res) => {
  try {
    const files = fs.readdirSync(resourcesDir, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name);

    const rawExamples = files
      .filter((name) => name.toLowerCase().endsWith('.txt'))
      .map((name) => ({ id: name, name }));

    const jsonExamples = files
      .filter((name) => name.toLowerCase().endsWith('.json'))
      .map((name) => buildRunSummary(path.join(resourcesDir, name), 'example'));

    res.json({ rawExamples, jsonExamples });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to read resources.' });
  }
});

app.get('/api/examples/raw/:name', (req, res) => {
  const safeName = path.basename(req.params.name || '');
  const filePath = path.join(resourcesDir, safeName);

  if (!safeName.toLowerCase().endsWith('.txt') || !fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Raw example not found.' });
  }

  res.json({
    id: safeName,
    name: safeName,
    content: fs.readFileSync(filePath, 'utf8')
  });
});

app.get('/api/runs', (_req, res) => {
  try {
    const generatedRuns = fs.readdirSync(runsDir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.json'))
      .map((entry) => buildRunSummary(path.join(runsDir, entry.name), 'generated'));

    const exampleRuns = fs.readdirSync(resourcesDir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.json'))
      .map((entry) => buildRunSummary(path.join(resourcesDir, entry.name), 'example'));

    const runs = [...generatedRuns, ...exampleRuns].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    res.json({ runs });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to list runs.' });
  }
});

app.get('/api/runs/:fileName', (req, res) => {
  const record = resolveStoredRun(req.params.fileName || '');

  if (!record) {
    return res.status(404).json({ error: 'Run not found.' });
  }

  try {
    res.json(loadRunByFile(record.path, record.source));
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to read run.' });
  }
});

app.post('/api/runs', (req, res) => {
  const { name, sourceHtmlName = '', items = [], metadata = {} } = req.body || {};

  if (!Array.isArray(items) || !items.length) {
    return res.status(400).json({ error: 'items must be a non-empty array.' });
  }

  const createdAt = new Date().toISOString();
  const runName = String(name || sourceHtmlName || 'transcription-run').trim();
  const slug = safeSlug(runName);
  const fileName = `${createdAt.replace(/[:.]/g, '-')}-${slug}.json`;
  const filePath = path.join(runsDir, fileName);
  const payload = {
    id: fileName,
    name: runName,
    createdAt,
    sourceHtmlName: sourceHtmlName || null,
    metadata,
    items
  };

  try {
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
    res.status(201).json({
      ok: true,
      run: buildRunSummary(filePath, 'generated')
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to save run.' });
  }
});

app.patch('/api/runs/:fileName', (req, res) => {
  const filePath = resolveGeneratedRun(req.params.fileName || '');
  const nextName = String(req.body?.name || '').trim();

  if (!filePath) {
    return res.status(404).json({ error: 'Generated run not found.' });
  }

  if (!nextName) {
    return res.status(400).json({ error: 'name is required.' });
  }

  try {
    const payload = readJsonFile(filePath);

    if (Array.isArray(payload)) {
      return res.status(400).json({ error: 'Example runs cannot be renamed.' });
    }

    payload.name = nextName;
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');

    res.json({
      ok: true,
      run: buildRunSummary(filePath, 'generated')
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to rename run.' });
  }
});

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

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path === '/health') {
    return next();
  }

  return res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
