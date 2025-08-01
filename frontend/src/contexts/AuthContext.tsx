import React, { createContext, useContext, useState, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { setToken as setGlobalToken } from '../services/TokenStore';

type DecodedTokenRaw = {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role_name: string;
  role_permissions: string; // raw string from JWT
};

type DecodedToken = DecodedTokenRaw & {
  role_permissions_parsed: string[]; // parsed array
};

type AuthContextType = {
  token: string | null;
  user: DecodedToken | null;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  login: () => {},
  logout: () => {}
});

export const useAuth = () => useContext(AuthContext);

type AuthProviderProps = {
  children: ReactNode;
};

const parsePermissions = (permString: string): string[] => {
  try {
    if (!permString) return [];
    return permString
      .replace(/^\[|\]$/g, '')
      .split(',')
      .map(p => p.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
  } catch {
    return [];
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<DecodedToken | null>(null);

  const decodeAndSetUser = (jwt: string) => {
    const raw = jwtDecode<DecodedTokenRaw>(jwt);
    const parsed: DecodedToken = {
      ...raw,
      role_permissions_parsed: parsePermissions(raw.role_permissions)
    };
    setUser(parsed);
  };

  const login = (newToken: string) => {
    setTokenState(newToken);
    setGlobalToken(newToken);
    decodeAndSetUser(newToken);
  };

  const logout = () => {
    setTokenState(null);
    setGlobalToken(null);
    setUser(null);
  };

  // Make logout callable from Axios interceptor
  (window as any).logout = logout;

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { jwtDecode } from 'jwt-decode';

// type DecodedTokenRaw = {
//   user_id: number;
//   first_name: string;
//   last_name: string;
//   email: string;
//   role_name: string;
//   role_permissions: string; // raw string from JWT
// };

// type DecodedToken = DecodedTokenRaw & {
//   role_permissions_parsed: string[]; // parsed array
// };

// type AuthContextType = {
//   token: string | null;
//   user: DecodedToken | null;
//   login: (token: string) => void;
//   logout: () => void;
// };

// const AuthContext = createContext<AuthContextType>({
//   token: null,
//   user: null,
//   login: () => {},
//   logout: () => {}
// });

// export const useAuth = () => useContext(AuthContext);

// type AuthProviderProps = {
//   children: ReactNode;
// };

// // --- Helper to parse Python list string to JS array ---
// const parsePermissions = (permString: string): string[] => {
//   try {
//     if (!permString) return [];
//     // Remove brackets and quotes
//     return permString
//       .replace(/^\[|\]$/g, '')      // remove [ and ]
//       .split(',')
//       .map(p => p.trim().replace(/^'|'$/g, '').replace(/^"|"$/g, '')) // strip quotes
//       .filter(Boolean);
//   } catch {
//     return [];
//   }
// };

// export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
//   const [token, setToken] = useState<string | null>(null);
//   const [user, setUser] = useState<DecodedToken | null>(null);

//   useEffect(() => {
//     const storedToken = localStorage.getItem('token');
//     if (storedToken) {
//       setToken(storedToken);
//       decodeAndSetUser(storedToken);
//     }
//   }, []);

//   const decodeAndSetUser = (jwt: string) => {
//     const raw = jwtDecode<DecodedTokenRaw>(jwt);
//     const parsed: DecodedToken = {
//       ...raw,
//       role_permissions_parsed: parsePermissions(raw.role_permissions)
//     };
//     setUser(parsed);
//   };

//   const login = (newToken: string) => {
//     setToken(newToken);
//     localStorage.setItem('token', newToken);
//     decodeAndSetUser(newToken);
//   };

//   const logout = () => {
//     setToken(null);
//     setUser(null);
//     localStorage.removeItem('token');
//   };

//   // expose logout to axios interceptor via global
//   (window as any).logout = logout;

//   return (
//     <AuthContext.Provider value={{ token, user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
