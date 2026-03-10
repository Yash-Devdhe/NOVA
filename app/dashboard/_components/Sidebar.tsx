"use client";

import { Fullscreen } from "lucide-react";
import React, { useState, createContext, useContext } from "react";

export type SidebarContextType = {
  open: boolean;
  toggleSidebar: () => void;
};

// 1. Keep the default as undefined to track if the Provider is missing
export const SidebarContext =
  createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const toggleSidebar = () => setOpen((prev) => !prev);

  return (
    <SidebarContext.Provider value={{ open, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  // Instead of throwing, we return the context (which might be undefined)
  return context;
}

type SidebarProps = {
  children: React.ReactNode;
};

export function Sidebar({ children }: SidebarProps) {
  const context = useSidebar();
  
  // 2. Safe check: If context is missing, use default values
  const open = context?.open ?? false;

  return (
    <aside
      aria-hidden={!open}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        width: 256,
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 200ms ease",
        backgroundColor: "white",
        borderRight: "1px solid rgba(0,0,0,0.06)",
        zIndex: 40,
        overflowY: "auto",
        padding: 12,
      }}
    >
      {children}
    </aside>
  );
}

export function SidebarTrigger() {
  const context = useSidebar();

  // 3. Safe check: Use optional chaining to avoid crashing if context is null/undefined
  const toggleSidebar = () => context?.toggleSidebar();

  return (
    <button
      onClick={toggleSidebar}
      aria-label="Toggle sidebar"
      style={{
        background: "transparent",
        border: "none",
        padding: 6,
        cursor: "pointer",
        fontSize: 16,
        height: 50,
        width: 1400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Added a placeholder icon/text so the button is visible */}
      <Fullscreen className="w-88 h-4" />
    </button>
  );
}