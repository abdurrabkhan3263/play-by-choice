import "next-auth";
import { CredentialType } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    image: string;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image: string;
      accessToken?: string;
      refreshToken?: string;
      provider: CredentialType;
      accessTokenExpires?: number;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    image: string;
    accessToken?: string;
    refreshToken?: string;
    provider: CredentialType;
    accessTokenExpires?: number;
  }
}
