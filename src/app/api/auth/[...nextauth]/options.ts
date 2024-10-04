/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import Github from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { prismaClient } from "@/lib/db";
import bcrypt from "bcrypt";

enum Provider {
  Google = "Google",
  Github = "Github",
  Credential = "Credential",
}

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "credential",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (credentials) {
          const user = await prismaClient.user.findUnique({
            where: { email: credentials.email },
          });
          if (user) {
            if (user.provider !== Provider.Credential) {
              throw new Error(
                `login-with-other-provider&provider=${user.provider}`
              );
            }
            const isValid = await bcrypt.compare(
              credentials.password,
              user.password as string
            );
            if (isValid) {
              return user;
            } else {
              throw new Error("invalid-password");
            }
          } else {
            throw new Error("invalid-email");
          }
        } else {
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    Github({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
  ],
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.name = profile.name;
        token.email = profile.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        if (session && session.user) {
          session.user.email = token.email;
        }
      }
      return session;
    },
    async signIn({ account, profile, credentials }) {
      if (credentials) {
        return true;
      }
      try {
        const isUserExits = await prismaClient.user.findFirst({
          where: {
            email: profile?.email,
          },
        });
        if (
          isUserExits &&
          (isUserExits?.provider).toLowerCase() !==
            account?.provider?.toLowerCase()
        ) {
          return `/sign-in?error=login-with-other-provider&provider=${isUserExits.provider}`;
        }

        if (!isUserExits) {
          const createUser = await prismaClient.user.create({
            data: {
              name: profile?.name,
              provider: account?.provider === "google" ? "Google" : "Github",
              email: profile?.email as string,
              image:
                account?.provider === "google"
                  ? (profile as any)?.picture
                  : (profile as any)?.avatar_url,
            },
          });
          if (!createUser) {
            return `/sign-in?error=error_to_create_account`;
          }
          if (createUser) {
            return true;
          }
        }
        return true;
      } catch (error) {
        return `/sign-in?error=something-went-wrong&message=${error}`;
      }
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXT_AUTH_SECRET,
};
