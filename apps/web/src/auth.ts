// 'use server';
import NextAuth, { IUserDetails, User } from 'next-auth';
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
          let token;
          if (credentials.access_token) {
            const res = await api.post(
              '/auth/refresh-token',
              {},
              {
                headers: {
                  Authorization: `Bearer ${credentials.access_token}`,
                },
              },
            );

            token = res.data.data;
          } else if (credentials?.email && credentials?.password) {
            const res = await api.post('/auth/v1', {
              email: credentials?.email,
              password: credentials?.password,
            });
            token = res.data.data;
          } else {
            return null;
          }

          if (!token) throw new Error("Can't login");

          const user = jwtDecode<User>(token);

          user.access_token = token;

          return user;
        } catch (error) {
          console.log(error);

          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (account?.provider === 'google') {
        return await socialRegister({
          email: profile?.email as string,
          provider: 'google',
          first_name: profile?.given_name as string,
          last_name: (profile?.family_name as string) || '',
          phone_number: (profile?.phone_number as string) || '',
          image: profile?.picture as string,
        })
          .then((res) => {
            const userr = jwtDecode<User>(res);
            user.access_token = res;
            user.id = userr.id;
            user.roleId = userr.roleId;
            user.provider = userr.provider;
            user.image = userr.image;
            return true;
          })
          .catch((err) => {
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
        session.user.UserDetails = token.UserDetails as IUserDetails;

        session.user.roleId = token.roleId as number;
        session.user.image = token.image as string;
        session.user.access_token = token.access_token as string;
        session.user.name = session.user.name?.split(' ')[0] as string;
        session.user.provider = token.provider as string;
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
        token.UserDetails = user.UserDetails;
        token.roleId = Number(user.roleId);
        token.access_token = user.access_token;
        token.provider = user.provider;
      }

      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }
      return token;
    },
  },
});
