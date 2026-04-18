import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    console.log("TOKEN:", req.nextauth.token); // 🔥 debug
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return !!token; // must not be null
      },
    },
  }
);

export const config = {
  matcher: ["/booking", "/mybooking"],
};