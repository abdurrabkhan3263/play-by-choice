/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import SpotifyProvider from "next-auth/providers/spotify";
import Credentials from "next-auth/providers/credentials";
import prismaClient from "@/lib/db";
import bcrypt from "bcrypt";
import { capitalize } from "lodash";
import { refreshAccessToken } from "@/lib/spotifyApi";

enum Provider {
  Google = "Google",
  Spotify = "Spotify",
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
      async authorize(credentials: any): Promise<any> {
        if (credentials) {
          const user = await prismaClient.user.findUnique({
            where: { email: credentials?.email },
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
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID as string,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
      authorization: {
        params: { scope: "user-read-email playlist-read-private" },
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if ((account && profile) || token) {
        const user = await prismaClient.user.findFirst({
          where: {
            email: profile?.email ?? token?.email,
          },
        });

        if (user) {
          token.name =
            profile?.name ??
            (profile as any)?.display_name ??
            token?.name ??
            "";
          token.email = profile?.email ?? token?.email ?? "";
          token.id = user.id;
          token.image = profile?.image ?? "";
          token.accessToken = account?.access_token ?? token?.accessToken ?? "";
          token.refreshToken =
            account?.refresh_token ?? token?.refreshToken ?? "";
          token.provider = account?.provider ?? "";
          token.accessTokenExpires =
            account?.expires_at || token?.accessTokenExpires
              ? Date.now() +
                (account?.expires_at ?? token?.accessTokenExpires ?? 0) * 1000
              : undefined;
        }
      }

      if (
        token.provider === "spotify" &&
        token.accessTokenExpires &&
        Date.now() < token.accessTokenExpires
      ) {
        return token;
      } else if (token.provider !== "spotify") {
        return token;
      }
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token) {
        if (session && session.user) {
          session.user.email = token?.email ?? "";
          session.user.id = token.id ?? "";
          session.user.name = token.name ?? "";
          session.user.accessToken = token.accessToken ?? "";
          session.user.refreshToken = token.refreshToken ?? "";
          session.user.provider = token.provider ?? "";
          session.user.accessTokenExpires =
            token.accessTokenExpires ?? undefined;
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
          const provider = capitalize(account?.provider) as Provider;
          const createUser = await prismaClient.user.create({
            data: {
              name: profile?.name,
              provider,
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
