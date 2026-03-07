"use client";
import { fr } from "date-fns/locale";
import { ConvexProvider , ConvexReactClient} from "convex/react";
import { ReactNode } from "react";

// Use a placeholder URL for build - replace with your actual Convex URL in Vercel
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://placeholder.convex.cloud";
const convex = new ConvexReactClient(convexUrl);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
