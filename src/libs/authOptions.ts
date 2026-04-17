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

          // ✅ ถอดรหัส JWT เพื่อเอา role กับ name ออกมา
          const decoded: any = jwtDecode(res.token);

          return {
            id: decoded.id,
            email: credentials.email,
            name: decoded.name || "User", 
            token: res.token, 
            role: decoded.role || "user", // ดึงจาก token ที่ถอดรหัสแล้ว
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
        token.role = (user as any).role;   // ✅ ยัด role ใส่ token
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string; 
        (session.user as any).token = token.token; 
        (session.user as any).role = token.role;   // ✅ ส่ง role ไปให้หน้า BookingList ใช้
      }
      return session;
    },
  },

  pages: {
    signIn: "/signin",
  },

  secret: process.env.NEXTAUTH_SECRET,
};