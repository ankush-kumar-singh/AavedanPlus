import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Page load pe login user uthao
  useEffect(() => {
    const savedUser = localStorage.getItem('aavaedan_current_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('aavaedan_current_user');
      }
    }
    setLoading(false);
  }, []);

  // Saare registered users nikaalo
  const getRegisteredUsers = () => {
    try {
      return JSON.parse(localStorage.getItem('aavaedan_users') || '[]');
    } catch {
      return [];
    }
  };

  // Register — naya user banao
  const register = (userData) => {
    const users = getRegisteredUsers();

    // Check karo email already registered hai?
    const exists = users.find(
      (u) => u.email.toLowerCase() === userData.email.toLowerCase()
    );
    if (exists) {
      return { success: false, error: 'This email is already registered. Please login.' };
    }

    // Naya user banao
    const newUser = {
      id: 'USR-' + Math.floor(100000 + Math.random() * 900000),
      name: userData.name,
      email: userData.email,
      mobile: userData.mobile,
      password: userData.password, // ⚠️ Demo ke liye plain text (real app mein hash karo)
      registeredAt: new Date().toISOString(),
    };

    // Users list mein save karo
    users.push(newUser);
    localStorage.setItem('aavaedan_users', JSON.stringify(users));

    // Auto-login kar do
    const sessionUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      mobile: newUser.mobile,
      loginAt: new Date().toISOString(),
    };
    setUser(sessionUser);
    localStorage.setItem('aavaedan_current_user', JSON.stringify(sessionUser));

    return { success: true, user: sessionUser };
  };

  // Login — check karo credentials
  const login = (credentials) => {
    const users = getRegisteredUsers();

    // Email/Mobile se user dhoondho
    const found = users.find(
      (u) =>
        u.email.toLowerCase() === credentials.email?.toLowerCase() ||
        u.mobile === credentials.mobile
    );

    if (!found) {
      return { success: false, error: 'No account found. Please register first.' };
    }

    if (found.password !== credentials.password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    // Login successful
    const sessionUser = {
      id: found.id,
      name: found.name,
      email: found.email,
      mobile: found.mobile,
      loginAt: new Date().toISOString(),
    };
    setUser(sessionUser);
    localStorage.setItem('aavaedan_current_user', JSON.stringify(sessionUser));

    return { success: true, user: sessionUser };
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('aavaedan_current_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        getRegisteredUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export default AuthContext;