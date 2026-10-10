import { useState } from 'react';
import { AuthContext } from './authContext';

const USERS_KEY = 'aavaedan_users';
const CURRENT_USER_KEY = 'aavaedan_current_user';
const SESSION_USER_KEY = 'aavaedan_session_user';
const PBKDF2_ITERATIONS = 310_000;

function readCurrentUser() {
  try {
    const stored =
      sessionStorage.getItem(SESSION_USER_KEY) ||
      localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    sessionStorage.removeItem(SESSION_USER_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    return null;
  }
}

function readRegisteredUsers() {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

function saveSessionUser(user, rememberMe) {
  const storage = rememberMe ? localStorage : sessionStorage;
  const otherStorage = rememberMe ? sessionStorage : localStorage;
  storage.setItem(
    rememberMe ? CURRENT_USER_KEY : SESSION_USER_KEY,
    JSON.stringify(user)
  );
  otherStorage.removeItem(
    rememberMe ? SESSION_USER_KEY : CURRENT_USER_KEY
  );
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(value) {
  return new Uint8Array(value.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
}

function createSalt() {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error('Secure password storage is unavailable in this browser. Use localhost or HTTPS.');
  }
  return bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
}

async function hashPassword(password, salt) {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Secure password storage is unavailable in this browser. Use localhost or HTTPS.');
  }
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const digest = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: hexToBytes(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    key,
    256
  );
  return bytesToHex(new Uint8Array(digest));
}

function constantTimeEqual(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string' || left.length !== right.length) {
    return false;
  }
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function makeUserId() {
  if (globalThis.crypto?.randomUUID) return `USR-${crypto.randomUUID()}`;
  return `USR-${bytesToHex(crypto.getRandomValues(new Uint8Array(16)))}`;
}

function toSessionUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    loginAt: new Date().toISOString(),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readCurrentUser);
  const loading = false;

  const register = async (userData, rememberMe = false) => {
    const users = readRegisteredUsers();
    const email = String(userData.email || '').trim().toLowerCase();
    const mobile = String(userData.mobile || '').replace(/\D/g, '');
    const name = String(userData.name || '').trim();

    if (users.some((savedUser) => savedUser.email?.toLowerCase() === email)) {
      return { success: false, error: 'This email is already registered. Please login.' };
    }
    if (users.some((savedUser) => savedUser.mobile === mobile)) {
      return { success: false, error: 'This mobile number is already registered.' };
    }

    try {
      const salt = createSalt();
      const passwordHash = await hashPassword(userData.password, salt);
      const newUser = {
        id: makeUserId(),
        name,
        email,
        mobile,
        passwordSalt: salt,
        passwordHash,
        passwordIterations: PBKDF2_ITERATIONS,
        registeredAt: new Date().toISOString(),
      };
      users.push(newUser);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));

      const sessionUser = toSessionUser(newUser);
      saveSessionUser(sessionUser, rememberMe);
      setUser(sessionUser);
      return { success: true, user: sessionUser };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Could not create this account in the browser.',
      };
    }
  };

  const login = async (credentials, rememberMe = false) => {
    const users = readRegisteredUsers();
    const identifier = String(credentials.email || credentials.mobile || '')
      .trim()
      .toLowerCase();
    const found = users.find(
      (savedUser) =>
        savedUser.email?.toLowerCase() === identifier ||
        savedUser.mobile === identifier.replace(/\D/g, '')
    );

    if (!found) {
      return { success: false, error: 'No account found. Please register first.' };
    }

    try {
      let passwordMatches = false;
      if (found.passwordHash && found.passwordSalt) {
        const candidateHash = await hashPassword(
          credentials.password,
          found.passwordSalt
        );
        passwordMatches = constantTimeEqual(candidateHash, found.passwordHash);
      } else if (typeof found.password === 'string') {
        // Migrate accounts created by the earlier prototype without retaining the plaintext password.
        passwordMatches = constantTimeEqual(found.password, credentials.password);
        if (passwordMatches) {
          found.passwordSalt = createSalt();
          found.passwordHash = await hashPassword(
            credentials.password,
            found.passwordSalt
          );
          found.passwordIterations = PBKDF2_ITERATIONS;
          delete found.password;
          localStorage.setItem(USERS_KEY, JSON.stringify(users));
        }
      }

      if (!passwordMatches) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }

      const sessionUser = toSessionUser(found);
      saveSessionUser(sessionUser, rememberMe);
      setUser(sessionUser);
      return { success: true, user: sessionUser };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Could not sign in from this browser.',
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(SESSION_USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: Boolean(user),
        getRegisteredUsers: readRegisteredUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
