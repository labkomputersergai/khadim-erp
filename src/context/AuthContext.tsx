import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole } from '../types';

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  avatarInitials?: string;
  roleTitle: string;
}

export interface UserCredential extends AuthUser {
  passwordHash: string;
}

export const DEFAULT_USERS: UserCredential[] = [
  {
    id: 'usr-1',
    username: 'accountant',
    passwordHash: 'KhadimAcc2026!',
    name: 'Hafiva Rizky Balqis',
    avatarInitials: 'HR',
    email: 'accountant@khadimalharamain.com',
    role: 'ACCOUNTANT',
    roleTitle: 'Senior Accountant'
  },
  {
    id: 'usr-2',
    username: 'admin',
    passwordHash: 'KhadimAdmin2026!',
    name: 'Didin',
    avatarInitials: 'DI',
    email: 'admin@khadimalharamain.com',
    role: 'ADMIN_CS',
    roleTitle: 'Administrator ERP'
  },
  {
    id: 'usr-3',
    username: 'direktur',
    passwordHash: 'KhadimMgmt2026!',
    name: 'H. Indra Setiadi',
    avatarInitials: 'HI',
    email: 'direktur@khadimalharamain.com',
    role: 'DIREKSI_OWNER',
    roleTitle: 'Direktur Utama'
  },
  {
    id: 'usr-4',
    username: 'operasional',
    passwordHash: 'KhadimOps2026!',
    name: 'Sri Maharani',
    avatarInitials: 'SM',
    email: 'operasional@khadimalharamain.com',
    role: 'KASIR_FINANCE',
    roleTitle: 'Tim Operasional & Kasir'
  },
  {
    id: 'usr-5',
    username: 'sales',
    passwordHash: 'KhadimSales2026!',
    name: 'Henny Helma',
    avatarInitials: 'HH',
    email: 'sales@khadimalharamain.com',
    role: 'ADMIN_CS',
    roleTitle: 'Sales & Marketing'
  }
];

const OFFICIAL_PROFILE_MAPPING: Record<string, { name: string; avatarInitials: string }> = {
  accountant: { name: 'Hafiva Rizky Balqis', avatarInitials: 'HR' },
  admin: { name: 'Didin', avatarInitials: 'DI' },
  direktur: { name: 'H. Indra Setiadi', avatarInitials: 'HI' },
  operasional: { name: 'Sri Maharani', avatarInitials: 'SM' },
  sales: { name: 'Henny Helma', avatarInitials: 'HH' }
};

export const getAvatarInitials = (user?: AuthUser | null): string => {
  if (!user) return 'ERP';
  if (user.avatarInitials) return user.avatarInitials;
  if (!user.name) return 'ERP';
  const parts = user.name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string, rememberMe?: boolean) => { success: boolean; message: string };
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => { success: boolean; message: string };
  usersList: UserCredential[];
  updateRoleOverride: (role: UserRole) => void;
  updateUserByAdmin: (userId: string, updatedData: { name: string; email: string; username: string; role: UserRole; roleTitle?: string }) => { success: boolean; message: string };
  resetUserPasswordByAdmin: (userId: string, newPassword: string) => { success: boolean; message: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_AUTH_USER = 'khadim_auth_user_v1';
const STORAGE_CREDENTIALS = 'khadim_user_credentials_v1';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [credentials, setCredentials] = useState<UserCredential[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_CREDENTIALS);
      if (stored) {
        const parsed: UserCredential[] = JSON.parse(stored);
        return parsed.map((c) => {
          const mapping = OFFICIAL_PROFILE_MAPPING[c.username.toLowerCase()];
          if (mapping) {
            return { ...c, name: mapping.name, avatarInitials: mapping.avatarInitials };
          }
          return c;
        });
      }
    } catch (e) {
      console.error('Failed to parse credentials from localStorage', e);
    }
    return DEFAULT_USERS;
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_AUTH_USER);
      if (storedUser) {
        const parsed: AuthUser = JSON.parse(storedUser);
        const mapping = OFFICIAL_PROFILE_MAPPING[parsed.username.toLowerCase()];
        if (mapping) {
          return { ...parsed, name: mapping.name, avatarInitials: mapping.avatarInitials };
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse auth user from localStorage', e);
    }
    return null;
  });

  // Save credentials when updated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CREDENTIALS, JSON.stringify(credentials));
    } catch (e) {
      console.error('Failed to save credentials', e);
    }
  }, [credentials]);

  // Save user when updated
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_AUTH_USER);
      }
    } catch (e) {
      console.error('Failed to save auth user', e);
    }
  }, [user]);

  const login = (usernameInput: string, passwordInput: string, rememberMe = true) => {
    const cleanUsername = usernameInput.trim().toLowerCase();
    
    const foundUser = credentials.find(
      (u) => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanUsername
    );

    if (!foundUser) {
      return { success: false, message: 'Username atau Email tidak ditemukan!' };
    }

    if (foundUser.passwordHash !== passwordInput) {
      return { success: false, message: 'Kata sandi / Password salah!' };
    }

    const mapping = OFFICIAL_PROFILE_MAPPING[foundUser.username.toLowerCase()];
    const name = mapping?.name || foundUser.name;
    const avatarInitials = mapping?.avatarInitials || foundUser.avatarInitials || getAvatarInitials({ name } as AuthUser);

    const authUser: AuthUser = {
      id: foundUser.id,
      username: foundUser.username,
      name,
      avatarInitials,
      email: foundUser.email,
      role: foundUser.role,
      roleTitle: foundUser.roleTitle
    };

    setUser(authUser);
    return { success: true, message: `Selamat datang kembali, ${authUser.name}!` };
  };

  const logout = () => {
    setUser(null);
  };

  const changePassword = (currentPassword: string, newPassword: string) => {
    if (!user) {
      return { success: false, message: 'Sesi Anda telah berakhir. Silakan login kembali.' };
    }

    const currentCredIndex = credentials.findIndex((u) => u.id === user.id);
    if (currentCredIndex === -1) {
      return { success: false, message: 'Pengguna tidak ditemukan.' };
    }

    const userCred = credentials[currentCredIndex];
    if (userCred.passwordHash !== currentPassword) {
      return { success: false, message: 'Kata sandi saat ini tidak sesuai!' };
    }

    if (newPassword.length < 6) {
      return { success: false, message: 'Kata sandi baru minimal 6 karakter!' };
    }

    const updatedCreds = [...credentials];
    updatedCreds[currentCredIndex] = {
      ...userCred,
      passwordHash: newPassword
    };

    setCredentials(updatedCreds);
    return { success: true, message: 'Kata sandi berhasil diperbarui! Gunakan kata sandi baru untuk login berikutnya.' };
  };

  const updateRoleOverride = (role: UserRole) => {
    if (user) {
      setUser({
        ...user,
        role
      });
    }
  };

  const getRoleTitle = (role: UserRole, customTitle?: string): string => {
    if (customTitle && customTitle.trim()) return customTitle;
    switch (role) {
      case 'DIREKSI_OWNER': return 'Direktur Utama';
      case 'ACCOUNTANT': return 'Senior Accountant';
      case 'ADMIN_CS': return 'Administrator ERP';
      case 'KASIR_FINANCE': return 'Tim Operasional & Kasir';
      default: return 'Pengguna ERP';
    }
  };

  const updateUserByAdmin = (
    userId: string,
    data: { name: string; email: string; username: string; role: UserRole; roleTitle?: string }
  ) => {
    const targetIdx = credentials.findIndex((u) => u.id === userId);
    if (targetIdx === -1) {
      return { success: false, message: 'Pengguna tidak ditemukan.' };
    }

    const usernameTaken = credentials.some(
      (u) => u.id !== userId && u.username.toLowerCase() === data.username.trim().toLowerCase()
    );
    if (usernameTaken) {
      return { success: false, message: `Username "${data.username}" sudah digunakan pengguna lain!` };
    }

    const currentCred = credentials[targetIdx];
    const roleTitle = getRoleTitle(data.role, data.roleTitle || currentCred.roleTitle);
    const avatarInitials = getAvatarInitials({ name: data.name } as AuthUser);

    const updatedCred: UserCredential = {
      ...currentCred,
      name: data.name.trim(),
      email: data.email.trim(),
      username: data.username.trim(),
      role: data.role,
      roleTitle,
      avatarInitials
    };

    const updatedCreds = [...credentials];
    updatedCreds[targetIdx] = updatedCred;
    setCredentials(updatedCreds);

    if (user && user.id === userId) {
      setUser({
        ...user,
        name: updatedCred.name,
        email: updatedCred.email,
        username: updatedCred.username,
        role: updatedCred.role,
        roleTitle: updatedCred.roleTitle,
        avatarInitials: updatedCred.avatarInitials
      });
    }

    return { success: true, message: `Data akun ${updatedCred.name} berhasil diperbarui!` };
  };

  const resetUserPasswordByAdmin = (userId: string, newPassword: string) => {
    const targetIdx = credentials.findIndex((u) => u.id === userId);
    if (targetIdx === -1) {
      return { success: false, message: 'Pengguna tidak ditemukan.' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'Kata sandi baru minimal 6 karakter!' };
    }

    const updatedCreds = [...credentials];
    updatedCreds[targetIdx] = {
      ...updatedCreds[targetIdx],
      passwordHash: newPassword
    };

    setCredentials(updatedCreds);
    return {
      success: true,
      message: `Kata sandi untuk ${updatedCreds[targetIdx].name} berhasil direset!`
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        changePassword,
        usersList: credentials,
        updateRoleOverride,
        updateUserByAdmin,
        resetUserPasswordByAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
