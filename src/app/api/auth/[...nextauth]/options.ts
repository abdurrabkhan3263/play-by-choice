import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import SpotifyProvider from "next-auth/providers/spotify";
import prismaClient from "@/lib/db";
import { refreshAccessToken } from "@/lib/action/spotify";
import { refreshGAccessToken } from "@/lib/action/youtube";
import { CredentialType } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  providers: [
    // Credentials({
    //   name: "credential",
    //   credentials: {
    //     email: { label: "Email", type: "text" },
    //     password: { label: "Password", type: "password" },
    //   },
    //   async authorize(credentials: any): Promise<any> {
    //     if (credentials) {
    //       const user = await prismaClient.user.findUnique({
    //         where: { email: credentials?.email },
    //       });
    //       if (user) {
    //         if (user.provider !== Provider.Credential) {
    //           throw new Error(
    //             `login-with-other-provider&provider=${user.provider}`
    //           );
    //         }
    //         const isValid = await bcrypt.compare(
    //           credentials.password,
    //           user.password as string
    //         );
    //         if (isValid) {
    //           return user;
    //         } else {
    //           throw new Error("invalid-password");
    //         }
    //       } else {
    //         throw new Error("invalid-email");
    //       }
    //     } else {
    //       return null;
    //     }
    //   },
    // }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope:
            "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/youtube.readonly",
        },
      },
    }),
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID as string,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope:
            "user-read-email user-read-private user-modify-playback-state user-read-playback-state playlist-modify-public playlist-modify-private user-read-currently-playing streaming",
        },
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  // debug: process.env.NODE_ENV === "development",
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const user = await prismaClient.user.findFirst({
          where: {
            email: profile?.email ?? token?.email,
          },
        });

        if (user) {
          token.name = (profile as any)?.display_name ?? profile.name ?? "";
          token.email = profile?.email ?? "";
          token.id = user.id;
          token.image = profile?.image ?? "";
          token.accessToken = account?.access_token ?? "";
          token.refreshToken = account?.refresh_token ?? "";
          token.provider = account?.provider as CredentialType;
        }
      }

      if (account?.expires_at) {
        token.accessTokenExpires = account.expires_at * 1000;
      }

      if (
        token.accessTokenExpires &&
        Date.now() >= token.accessTokenExpires - 2 * 60 * 1000
      ) {
        if (token.provider === "spotify") {
          return refreshAccessToken(token);
        } else if (token.provider === "google") {
          return refreshGAccessToken({ token });
        }
      }
      return token;
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
    async signIn({ account, profile }) {
      try {
        console.log({ account, profile });
        const isUserExits = await prismaClient.user.findFirst({
          where: {
            email: profile?.email,
          },
        });
        console.log("isUserExits", isUserExits);
        if (
          account?.provider === "spotify" &&
          (profile as any)?.product !== "premium"
        ) {
          return `/sign-in?error=premium-account-required`;
        }
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
              name: profile?.name ?? ((profile as any)?.display_name as string),
              provider: account?.provider as CredentialType,
              email: profile?.email as string,
              image:
                account?.provider === "google"
                  ? (profile as any)?.picture
                  : (profile as any)?.images[0]?.url,
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
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXT_AUTH_SECRET,
};
