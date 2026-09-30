/**
 * Mock authentication utilities using localStorage.
 * Replace this module with a real Supabase/Firebase client later.
 */

const USERS_KEY = 'mova_users';
const SESSION_KEY = 'mova_session';

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return getSession() !== null;
}

export function signUp({ name, email, password }) {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { error: 'An account with this email already exists.' };
  }
  const user = {
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
    name,
    email: email.toLowerCase(),
    password, // In a real app this would be hashed — this is mock only
    avatar: name.charAt(0).toUpperCase(),
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  const session = { id: user.id, name: user.name, email: user.email, avatar: user.avatar };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { session };
}

export function logIn({ email, password }) {
  const users = getUsers();
  const user = users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!user) {
    return { error: 'Invalid email or password.' };
  }
  const session = { id: user.id, name: user.name, email: user.email, avatar: user.avatar };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { session };
}

export function logOut() {
  localStorage.removeItem(SESSION_KEY);
}
