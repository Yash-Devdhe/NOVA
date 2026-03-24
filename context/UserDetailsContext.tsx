"use client";

import { createContext, useState } from "react";

type UserDetailType = {
  _id?: string;
  name?: string;
  email?: string;
  token?: number;
};

type ContextType = {
  userDetail: UserDetailType | null;
  setUserDetail: React.Dispatch<React.SetStateAction<UserDetailType | null>>;
};

export const UserDetailContext = createContext<ContextType>({
  userDetail: null,
  setUserDetail: () => {},
});

export const UserDetailProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userDetail, setUserDetail] = useState<UserDetailType | null>(null);

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      {children}
    </UserDetailContext.Provider>
  );
};
