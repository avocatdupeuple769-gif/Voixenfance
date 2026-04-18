import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const TOKENS_FILE = path.join(DATA_DIR, "push_tokens.json");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readAll(): string[] {
  ensureDir();
  if (!fs.existsSync(TOKENS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(TOKENS_FILE, "utf8")) as string[];
  } catch {
    return [];
  }
}

function writeAll(tokens: string[]): void {
  ensureDir();
  fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2), "utf8");
}

export const tokenStore = {
  getAll(): string[] {
    return readAll();
  },

  add(token: string): void {
    const all = readAll();
    if (!all.includes(token)) {
      all.push(token);
      writeAll(all);
    }
  },

  remove(token: string): void {
    writeAll(readAll().filter((t) => t !== token));
  },
};
