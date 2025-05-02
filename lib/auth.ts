// Simple auth configuration without environment variables
export const authOptions = {
  // Basic configuration
  session: {
    strategy: "jwt",
  },
  // Add your auth providers here when needed
  providers: [],
  callbacks: {
    async jwt({ token }) {
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
        },
      }
    },
  },
}
