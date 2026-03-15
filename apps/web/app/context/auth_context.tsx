"use client";

import { type SessionProviderProps, SessionProvider } from "next-auth/react";

export function AuthProvider({ children, ...rest }: SessionProviderProps) {
  return <SessionProvider {...rest}>{children}</SessionProvider>;
}
