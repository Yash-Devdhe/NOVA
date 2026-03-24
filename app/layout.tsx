import type { Metadata } from "next";
import {Outfit} from 'next/font/google';
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ClerkProvider } from '@clerk/nextjs'
import { Provider } from "@radix-ui/react-tooltip";

export const metadata: Metadata = {
  title: "NOVA: No Code Virtual Agents",
  description: "The Website where you can create your own AI Virtual Agents without coding.",
};
const outfit = Outfit({subsets: ['latin']});
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={outfit.className} >

        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
        >

          <ConvexClientProvider>
            <Provider>
              {children}
            </Provider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
