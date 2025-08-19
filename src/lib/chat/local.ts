// src/lib/chat/local.ts
export type ChatMsg = { role: 'user' | 'assistant'; content: string; ts: number };
export type ChatConv = { id: string; title: string; updatedAt: number };

const LIST_KEY = 'chat_conversations';
const MSGS_PREFIX = 'chat_messages_';

type Listener = () => void;
let listeners: Set<Listener> = new Set();
function notify() { listeners.forEach(fn => { try { fn(); } catch {} }); }
function subscribe(fn: Listener) { listeners.add(fn); return () => { listeners.delete(fn); }; }

function safe<T>(f: () => T, fallback: T): T { try { return f(); } catch { return fallback; } }

function readList(): ChatConv[] {
  return safe(() => JSON.parse(localStorage.getItem(LIST_KEY) || '[]'), []);
}
function writeList(list: ChatConv[]) {
  localStorage.setItem(LIST_KEY, JSON.stringify(list));
  notify();
}

function msgsKey(id: string) { return `${MSGS_PREFIX}${id}`; }
function readMsgs(id: string): ChatMsg[] {
  return safe(() => JSON.parse(localStorage.getItem(msgsKey(id)) || '[]'), []);
}
function writeMsgs(id: string, msgs: ChatMsg[]) {
  localStorage.setItem(msgsKey(id), JSON.stringify(msgs));
  // bump updatedAt
  const list = readList();
  const i = list.findIndex(c => c.id === id);
  if (i >= 0) {
    list[i].updatedAt = Date.now();
    writeList(list);
  } else {
    list.unshift({ id, title: 'New chat', updatedAt: Date.now() });
    writeList(list);
  }
}

function ensure(id: string, title = 'New chat') {
  const list = readList();
  if (!list.some(c => c.id === id)) {
    list.unshift({ id, title, updatedAt: Date.now() });
    writeList(list);
  }
}
function setTitle(id: string, title: string) {
  const list = readList();
  const i = list.findIndex(c => c.id === id);
  if (i >= 0) {
    list[i].title = title || 'Untitled';
    list[i].updatedAt = Date.now();
    writeList(list);
  }
}
function remove(id: string) {
  localStorage.removeItem(msgsKey(id));
  const list = readList().filter(c => c.id !== id);
  writeList(list);
}
function list(): ChatConv[] {
  return readList().sort((a, b) => b.updatedAt - a.updatedAt);
}

export const chatLocal = {
  list,
  ensure,
  remove,
  setTitle,
  readMsgs,
  writeMsgs,
  subscribe, // returns () => void
};
