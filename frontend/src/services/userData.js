/**
 * userData.js — Service for persisting and retrieving user dashboard data.
 * Supports:
 * - LocalStorage (default for guests and offline usage)
 * - Supabase REST API (when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are present)
 */

const STORAGE_KEYS = {
  TRANSLATIONS: 'mova_translations',
  PROGRESS: 'mova_learning_progress',
  PHRASES: 'mova_quick_phrases',
  STATS: 'mova_user_stats',
};

// Default supported vocabulary (10 signs)
export const ALL_SUPPORTED_SIGNS = [
  { id: 'hello',        en: 'Hello',        ml: 'നമസ്കാരം', icon: '👋' },
  { id: 'good_morning', en: 'Good Morning', ml: 'സുപ്രഭാതം', icon: '🌅' },
  { id: 'thank_you',    en: 'Thank You',    ml: 'നന്ദി',     icon: '🙏' },
  { id: 'good',         en: 'Good',         ml: 'നല്ലത്',    icon: '👍' },
  { id: 'i',            en: 'I / Me',       ml: 'ഞാൻ',       icon: '👤' },
  { id: 'father',       en: 'Father',       ml: 'അച്ഛൻ',     icon: '👨' },
  { id: 'boy',          en: 'Boy',          ml: 'ആൺകുട്ടി',  icon: '👦' },
  { id: 'girl',         en: 'Girl',         ml: 'പെൺകുട്ടി', icon: '👧' },
  { id: 'bank',         en: 'Bank',         ml: 'ബാങ്ക്',     icon: '🏦' },
  { id: 'time',         en: 'Time',         ml: 'സമയം',     icon: '⏱️' },
];

const DEFAULT_PHRASES = [
  { id: 'phrase-1', en: 'Hello', ml: 'നമസ്കാരം', isDefault: true },
  { id: 'phrase-2', en: 'Thank you', ml: 'നന്ദി', isDefault: true },
  { id: 'phrase-3', en: 'Good morning', ml: 'സുപ്രഭാതം', isDefault: true },
  { id: 'phrase-4', en: 'Good', ml: 'നല്ലത്', isDefault: true },
  { id: 'phrase-5', en: 'Need help', ml: 'സഹായം വേണം', isDefault: true },
];

// Helper: safe JSON parsing
function readStorage(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('LocalStorage write failed:', e);
  }
}

/**
 * Format relative time (e.g. "Just now", "2m ago", "1h ago", "Yesterday")
 */
export function formatRelativeTime(dateInput) {
  if (!dateInput) return 'Recently';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 45) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 172800) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// ── 1. Translations ──────────────────────────────────────────────────────────

export async function getRecentTranslations(userId) {
  // If Supabase credentials exist, try remote query first
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey && userId) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/translations?user_id=eq.${userId}&order=created_at.desc&limit=5`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length) {
          return data;
        }
      }
    } catch {
      // Fall through to local storage
    }
  }

  // Local storage fallback
  const all = readStorage(STORAGE_KEYS.TRANSLATIONS, []);
  const userFiltered = userId ? all.filter(t => t.userId === userId || !t.userId) : all;
  return userFiltered.slice(0, 5);
}

export async function saveTranslation(userId, { en, ml, confidence = 0.9 }) {
  if (!en && !ml) return null;
  const newRecord = {
    id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: userId || null,
    en,
    ml,
    confidence,
    created_at: new Date().toISOString(),
  };

  // 1. Save locally
  const list = readStorage(STORAGE_KEYS.TRANSLATIONS, []);
  list.unshift(newRecord);
  writeStorage(STORAGE_KEYS.TRANSLATIONS, list.slice(0, 50)); // keep last 50

  // 2. Also register as a practiced sign if it matches supported vocabulary
  const matched = ALL_SUPPORTED_SIGNS.find(s => s.en.toLowerCase() === en.toLowerCase() || s.id === en.toLowerCase());
  if (matched) {
    await recordSignPracticed(userId, matched.id);
  }

  // 3. Update day streak & activity
  recordDailyActivity(userId);

  // 4. Try remote sync if Supabase is active
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseKey && userId) {
    fetch(`${supabaseUrl}/rest/v1/translations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        user_id: userId,
        english_text: en,
        malayalam_text: ml,
        confidence,
        created_at: newRecord.created_at,
      }),
    }).catch(() => {});
  }

  return newRecord;
}

// ── 2. Learning Progress ─────────────────────────────────────────────────────

export async function getLearningProgress(userId) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey && userId) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/learning_progress?user_id=eq.${userId}`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          return data.map(d => d.sign_key);
        }
      }
    } catch {
      // Fall through
    }
  }

  const progress = readStorage(STORAGE_KEYS.PROGRESS, {});
  const userProgress = userId ? (progress[userId] || progress['default'] || []) : (progress['default'] || []);
  return userProgress;
}

export async function recordSignPracticed(userId, signKey) {
  const userKey = userId || 'default';
  const progress = readStorage(STORAGE_KEYS.PROGRESS, {});
  const userList = new Set(progress[userKey] || []);
  userList.add(signKey);
  progress[userKey] = Array.from(userList);
  writeStorage(STORAGE_KEYS.PROGRESS, progress);

  recordDailyActivity(userId);

  // Remote sync
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseKey && userId) {
    fetch(`${supabaseUrl}/rest/v1/learning_progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        user_id: userId,
        sign_key: signKey,
        practiced_at: new Date().toISOString(),
      }),
    }).catch(() => {});
  }

  return Array.from(userList);
}

// ── 3. Real Usage Stats ──────────────────────────────────────────────────────

export function getStats(userId, practicedSigns = [], translations = []) {
  const statsKey = userId ? `mova_stats_${userId}` : 'mova_stats_default';
  const stats = readStorage(statsKey, { streak: 1, lastActive: new Date().toDateString(), activeDays: [new Date().toDateString()] });

  // Translations today
  const todayStr = new Date().toDateString();
  const translationsToday = translations.filter(t => {
    try {
      return new Date(t.created_at).toDateString() === todayStr;
    } catch {
      return false;
    }
  }).length;

  return {
    signsPracticed: practicedSigns.length,
    totalSigns: ALL_SUPPORTED_SIGNS.length,
    translationsToday,
    dayStreak: stats.streak || 1,
  };
}

export function recordDailyActivity(userId) {
  const statsKey = userId ? `mova_stats_${userId}` : 'mova_stats_default';
  const todayStr = new Date().toDateString();
  const stats = readStorage(statsKey, { streak: 1, lastActive: todayStr, activeDays: [todayStr] });

  if (!stats.activeDays) stats.activeDays = [stats.lastActive || todayStr];

  if (!stats.activeDays.includes(todayStr)) {
    // Check if yesterday was active
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (stats.activeDays.includes(yesterdayStr)) {
      stats.streak = (stats.streak || 1) + 1;
    } else {
      stats.streak = 1;
    }

    stats.activeDays.push(todayStr);
    stats.lastActive = todayStr;
    writeStorage(statsKey, stats);
  }
}

// ── 4. Quick Phrases ─────────────────────────────────────────────────────────

export async function getQuickPhrases(userId) {
  const phrasesKey = userId ? `mova_phrases_${userId}` : 'mova_phrases_default';
  const saved = readStorage(phrasesKey, null);
  if (saved && Array.isArray(saved) && saved.length > 0) {
    return saved;
  }
  return DEFAULT_PHRASES;
}

export async function addQuickPhrase(userId, { en, ml }) {
  const phrasesKey = userId ? `mova_phrases_${userId}` : 'mova_phrases_default';
  const list = await getQuickPhrases(userId);
  const newPhrase = {
    id: `phrase-${Date.now()}`,
    en,
    ml,
    isCustom: true,
  };
  const updated = [...list, newPhrase];
  writeStorage(phrasesKey, updated);
  return updated;
}

export async function deleteQuickPhrase(userId, phraseId) {
  const phrasesKey = userId ? `mova_phrases_${userId}` : 'mova_phrases_default';
  const list = await getQuickPhrases(userId);
  const updated = list.filter(p => p.id !== phraseId);
  writeStorage(phrasesKey, updated);
  return updated;
}
