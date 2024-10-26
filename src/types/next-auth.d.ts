import "next-auth";

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
      provider: string;
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
    provider: string;
    accessTokenExpires?: number;
  }
}
