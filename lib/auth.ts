import NextAuth from 'next-auth'
import { Buffer } from 'buffer'
import Google from 'next-auth/providers/google'
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id'
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
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      issuer: `https://login.microsoftonline.com/${process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID}/v2.0`,
      authorization: {
        params: {
          scope: 'openid profile email User.Read',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Fetch Microsoft profile photo on sign in
      if (account && account.provider === 'microsoft-entra-id' && account.access_token) {
        try {
          // Fetch a small thumbnail to keep token size low (cookie limit is ~4KB)
          const response = await fetch('https://graph.microsoft.com/v1.0/me/photos/64x64/$value', {
            headers: { Authorization: `Bearer ${account.access_token}` },
          })

          if (response.ok) {
            const buffer = await response.arrayBuffer()
            const base64 = Buffer.from(buffer).toString('base64')
            token.picture = `data:image/jpeg;base64,${base64}`
          }
        } catch (error) {
          console.error('Failed to fetch Microsoft profile photo:', error)
        }
      }

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
