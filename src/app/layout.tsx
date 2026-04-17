import type { Metadata } from "next";
import "./globals.css";
import TopMenu from "@/components/TopMenu";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/authOptions";
import NextAuthProvider from "@/providers/NextAuthProvider";
import ReduxProvider from "@/redux/ReduxProvider";

export const metadata: Metadata = {
  title: "CoSpace — Find Your Perfect Workspace",
  description: "Discover and reserve coworking spaces that inspire creativity and productivity.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const nextAuthSession = await getServerSession(authOptions);

  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Playfair+Display:wght@700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Nunito', sans-serif", paddingTop: "52px" }}>
        <NextAuthProvider session={nextAuthSession}>
          <ReduxProvider>
            <TopMenu />
            {children}
          </ReduxProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}