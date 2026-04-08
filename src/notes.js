/**
 * notes.js - Session Notes & Tags Manager
 *
 * Stores user notes and tags for sessions in ~/.ccdash/notes.json
 * Read/write only to our own data directory, never touches Claude Code files.
 */

import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';

const DATA_DIR = join(homedir(), '.ccdash');
const NOTES_FILE = join(DATA_DIR, 'notes.json');

let _cache = null;

/**
 * Create a default empty session entry.
 */
function defaultSessionEntry() {
  return { note: '', tags: [], rename: '' };
}

/**
 * Ensure data directory exists.
 */
async function ensureDataDir() {
  try {
    await mkdir(DATA_DIR, { recursive: true });
  } catch {
    // Already exists
  }
}

/**
 * Load notes from disk.
 */
export async function loadNotes(forceRefresh = false) {
  if (_cache && !forceRefresh) return _cache;

  try {
    const content = await readFile(NOTES_FILE, 'utf-8');
    _cache = JSON.parse(content);
  } catch {
    _cache = { sessions: {}, tags: [] };
  }

  return _cache;
}

/**
 * Save notes to disk atomically (write to tmp then rename).
 */
export async function saveNotes(data) {
  await ensureDataDir();
  _cache = data;
  const tmpFile = NOTES_FILE + '.tmp.' + Date.now();
  try {
    await writeFile(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
    await rename(tmpFile, NOTES_FILE);
  } catch (err) {
    // Clean up tmp file on failure
    try { await writeFile(NOTES_FILE, JSON.stringify(data, null, 2), 'utf-8'); } catch {}
    try { const { unlink } = await import('node:fs/promises'); await unlink(tmpFile); } catch {}
    throw err;
  }
}

/**
 * Get notes for a specific session.
 */
export async function getSessionNotes(sessionId) {
  const data = await loadNotes();
  return data.sessions[sessionId] || defaultSessionEntry();
}

/**
 * Ensure session entry exists in data.
 */
function ensureSession(data, sessionId) {
  if (!data.sessions[sessionId]) {
    data.sessions[sessionId] = defaultSessionEntry();
  }
  return data.sessions[sessionId];
}

/**
 * Set note for a session.
 */
export async function setSessionNote(sessionId, note) {
  const data = await loadNotes();
  ensureSession(data, sessionId).note = note;
  await saveNotes(data);
}

/**
 * Set a display rename/alias for a session.
 */
export async function setSessionRename(sessionId, renameVal) {
  const data = await loadNotes();
  ensureSession(data, sessionId).rename = renameVal || '';
  await saveNotes(data);
}

/**
 * Add a tag to a session.
 */
export async function addSessionTag(sessionId, tag) {
  const data = await loadNotes();
  const entry = ensureSession(data, sessionId);
  if (!entry.tags.includes(tag)) {
    entry.tags.push(tag);
  }
  // Track all unique tags
  if (!data.tags.includes(tag)) {
    data.tags.push(tag);
  }
  await saveNotes(data);
}

/**
 * Remove a tag from a session.
 */
export async function removeSessionTag(sessionId, tag) {
  const data = await loadNotes();
  if (data.sessions[sessionId]) {
    data.sessions[sessionId].tags = data.sessions[sessionId].tags.filter(t => t !== tag);
    await saveNotes(data);
  }
}

/**
 * Get all available tags.
 */
export async function getAllTags() {
  const data = await loadNotes();
  return data.tags || [];
}

/**
 * Get all sessions with a specific tag.
 */
export async function getSessionsByTag(tag) {
  const data = await loadNotes();
  const results = [];
  for (const [sessionId, info] of Object.entries(data.sessions)) {
    if (info.tags && info.tags.includes(tag)) {
      results.push(sessionId);
    }
  }
  return results;
}
