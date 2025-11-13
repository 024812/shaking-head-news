import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { getStorageItem, setStorageItem, StorageKeys } from './storage'
import { defaultSettings } from '@/types/settings'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
    async signIn({ user }) {
      try {
        // 首次登录时初始化用户设置
        const key = StorageKeys.userSettings(user.id!)
        const existingSettings = await getStorageItem(key)

        if (!existingSettings) {
          await setStorageItem(key, {
            ...defaultSettings,
            userId: user.id,
          })
        }

        return true
      } catch (error) {
        console.error('Error during sign in:', error)
        return false
      }
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
})
