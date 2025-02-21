'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserName, getUserType } from '../utils/storage';

interface UserContextType {
  userName: string;
  userType: string;
  setUserInfo: (name: string, type: string) => void;
}

const UserContext = createContext<UserContextType>({
  userName: '',
  userType: '',
  setUserInfo: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState('');
  const [userType, setUserType] = useState('');

  useEffect(() => {
    const name = getUserName();
    const type = getUserType();
    if (name) setUserName(name);
    if (type) setUserType(type);
  }, []);

  const setUserInfo = (name: string, type: string) => {
    setUserName(name);
    setUserType(type);
  };

  return (
    <UserContext.Provider value={{ userName, userType, setUserInfo }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
