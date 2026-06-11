const HISTORY_KEY = "genesis_wallets";

export interface WalletEntry {
  pk: string;
  addr: string;
  createdAt: number;
  label?: string;
}

export function loadWalletHistory(): WalletEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveWalletHistory(wallets: WalletEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(wallets));
}

export function addWallet(pk: string, addr: string): WalletEntry {
  const history = loadWalletHistory();
  const existing = history.find((w) => w.addr.toLowerCase() === addr.toLowerCase());
  if (existing) {
    existing.pk = pk;
    saveWalletHistory(history);
    return existing;
  }
  const entry: WalletEntry = { pk, addr, createdAt: Date.now() };
  history.unshift(entry);
  saveWalletHistory(history);
  return entry;
}

export function getActiveWallet(): WalletEntry | null {
  const history = loadWalletHistory();
  return history.length > 0 ? history[0] : null;
}

export function setActiveWallet(addr: string): WalletEntry | null {
  const history = loadWalletHistory();
  const idx = history.findIndex((w) => w.addr.toLowerCase() === addr.toLowerCase());
  if (idx === -1) return null;
  const [entry] = history.splice(idx, 1);
  history.unshift(entry);
  saveWalletHistory(history);
  return entry;
}

export function removeWallet(addr: string) {
  const history = loadWalletHistory();
  const filtered = history.filter((w) => w.addr.toLowerCase() !== addr.toLowerCase());
  saveWalletHistory(filtered);
}

export function getActivePrivateKey(): string | null {
  const active = getActiveWallet();
  return active ? active.pk : null;
}
