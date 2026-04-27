import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import userLogin from "@/libs/userLogIn";
import { jwtDecode } from "jwt-decode";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials) return null;

        try {
          const res = await userLogin(
            credentials.email,
            credentials.password
          );

          if (!res || !res.token) return null;

          // ✅ decode JWT
          const decoded: any = jwtDecode(res.token);

          return {
            id: decoded.id,
            email: credentials.email,
            name: decoded.name || "User",
            token: res.token,
            role: decoded.role || "user",
          };
        } catch (err) {
          console.error("Authorize error:", err);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = (user as any).name;
        token.token = (user as any).token;
        token.role = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        (session.user as any).token = token.token;
        (session.user as any).role = token.role;
      }
      return session;
    },

    // ✅ ADD THIS (fix open redirect / ZAP warning)
    async redirect({ url, baseUrl }) {
      // allow same-origin
      if (url.startsWith(baseUrl)) return url;

      // allow relative paths
      if (url.startsWith("/")) return baseUrl + url;

      // block external redirects
      return baseUrl;
    },
  },

  pages: {
    signIn: "/signin",
  },

  secret: process.env.NEXTAUTH_SECRET,
};