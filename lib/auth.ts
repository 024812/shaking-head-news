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
    async jwt({ token, user, account }) {
      // 使用Google的sub作为稳定的用户ID
      if (user) {
        token.id = account?.providerAccountId || user.email || user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
    async signIn({ user, account }) {
      try {
        // 使用稳定的用户标识符
        const userId = account?.providerAccountId || user.email || user.id

        // 首次登录时初始化用户设置
        const key = StorageKeys.userSettings(userId!)
        const existingSettings = await getStorageItem(key)

        if (!existingSettings) {
          await setStorageItem(key, {
            ...defaultSettings,
            userId,
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
