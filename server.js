const fs = require('fs');
const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.static(PUBLIC_DIR));
app.use('/locales', express.static(path.join(PUBLIC_DIR, 'locales')));

const ensureDataFile = () => {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
  }
};

const readEntries = () => {
  ensureDataFile();

  try {
    const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(rawData);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to read data.json:', error);
    return [];
  }
};

const writeEntries = (entries) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(entries, null, 2), 'utf-8');
};

let entries = readEntries();

const broadcastEntries = () => {
  io.emit('entries:update', entries);
};

app.get('/api/entries', (_req, res) => {
  res.json(entries);
});

app.post('/api/entries', (req, res) => {
  const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';

  if (!text) {
    return res.status(400).json({ error: 'Text is required.' });
  }

  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text,
    isCompleted: false,
  };

  entries = [...entries, entry];
  writeEntries(entries);
  broadcastEntries();

  return res.status(201).json(entry);
});

app.patch('/api/entries/:id', (req, res) => {
  const { id } = req.params;
  const { isCompleted } = req.body;

  if (typeof isCompleted !== 'boolean') {
    return res.status(400).json({ error: 'isCompleted must be a boolean.' });
  }

  const entryIndex = entries.findIndex((entry) => entry.id === id);

  if (entryIndex === -1) {
    return res.status(404).json({ error: 'Entry not found.' });
  }

  entries = entries.map((entry) => (
    entry.id === id ? { ...entry, isCompleted } : entry
  ));
  writeEntries(entries);
  broadcastEntries();

  return res.json(entries[entryIndex]);
});

io.on('connection', (socket) => {
  socket.emit('entries:update', entries);

  socket.on('entry:add', (payload, callback) => {
    const text = typeof payload?.text === 'string' ? payload.text.trim() : '';

    if (!text) {
      callback?.({ ok: false, error: 'Text is required.' });
      return;
    }

    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text,
      isCompleted: false,
    };

    entries = [...entries, entry];
    writeEntries(entries);
    broadcastEntries();
    callback?.({ ok: true, entry });
  });

  socket.on('entry:toggle', (payload, callback) => {
    const entryId = payload?.id;
    const isCompleted = payload?.isCompleted;

    if (typeof entryId !== 'string' || typeof isCompleted !== 'boolean') {
      callback?.({ ok: false, error: 'Invalid payload.' });
      return;
    }

    const entryExists = entries.some((entry) => entry.id === entryId);

    if (!entryExists) {
      callback?.({ ok: false, error: 'Entry not found.' });
      return;
    }

    entries = entries.map((entry) => (
      entry.id === entryId ? { ...entry, isCompleted } : entry
    ));
    writeEntries(entries);
    broadcastEntries();
    callback?.({ ok: true });
  });
});

server.listen(PORT, () => {
  console.log(`OverlayList listening on http://localhost:${PORT}`);
});
