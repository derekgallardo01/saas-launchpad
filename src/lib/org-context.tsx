"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface OrgContextValue {
  orgId: string;
  setOrgId: (id: string) => void;
}

const OrgContext = createContext<OrgContextValue | null>(null);

export function OrgProvider({ children }: { children: ReactNode }) {
  const [orgId, setOrgId] = useState("demo");
  return (
    <OrgContext.Provider value={{ orgId, setOrgId }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useCurrentOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useCurrentOrg must be used within OrgProvider");
  return ctx;
}
