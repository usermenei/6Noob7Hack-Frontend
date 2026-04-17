export { default } from "next-auth/middleware"

export const config = {
  // Only protect routes that truly require login
  // /booking and /mybooking must be accessible without login per A10
  matcher: ['/booking','/mybooking']
}