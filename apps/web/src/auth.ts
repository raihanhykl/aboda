// 'use server';
import NextAuth, { User } from 'next-auth';
import Credential from 'next-auth/providers/credentials';
import google from 'next-auth/providers/google';
import { api } from './config/axios.config';
import { jwtDecode } from 'jwt-decode';
import { registerAction, socialRegister } from './action/auth.action';
import { redirect } from 'next/navigation';

export const { signIn, signOut, handlers, auth } = NextAuth({
  pages: {
    signIn: '/signin',
  },
  session: {
    strategy: 'jwt',
  },
  providers: [
    google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credential({
      authorize: async (credentials) => {
        try {
          if (!credentials || !credentials?.email || !credentials?.password)
            return null;

          const res = await api.post('/auth/v1', {
            email: credentials?.email,
            password: credentials?.password,
          });

          const token = res.data.data;

          if (!token) throw new Error("Can't login");

          const user = jwtDecode<User>(token);
          user.access_token = token;

          return user;
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (account?.provider === 'google') {
        console.log('user: ', user);
        return await socialRegister({
          email: profile?.email as string,
          provider: 'google',
          first_name: profile?.given_name as string,
          last_name: (profile?.family_name as string) || '',
          phone_number: (profile?.phone_number as string) || '',
        })
          .then((res) => {
            console.log('success saving user info social login');
            return true;
          })
          .catch((err) => {
            console.log('error: ', err);

            return '/signin';
          });
      }
      return true;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.first_name = token.first_name as string;
        session.user.last_name = token.last_name as string;
        session.user.email = token.email as string;
        session.user.phone_number = token.phone_number as string;
        session.user.referral_code = token.referral_code as string;
        session.user.f_referral_code = token.f_referral_code as string;
        session.user.roleId = token.roleId as number;
        session.user.image = token.image as string;
        session.user.access_token = token.access_token as string;
        session.user.name = session.user.name?.split(' ')[0] as string;
      }
      return session;
    },
    async jwt({ token, user, account, profile, trigger, session }) {
      if (user) {
        token.id = Number(user.id);
        token.first_name = user.first_name;
        token.last_name = user.last_name;
        token.email = user.email;
        token.phone_number = user.phone_number;
        token.image = user.image;
        token.referral_code = user.referral_code;
        token.f_referral_code = user.f_referral_code;
        token.roleId = Number(user.roleId);
        token.access_token = user.access_token;
      }

      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }
      return token;
    },
  },
});
