import { StreamType } from "@prisma/client";

declare type CreateStreamType = {
  url: string;
  extractedId: string;
  title: string;
  smallImg: string;
  bigImg: string;
  createdAt: Date;
  type: StreamType;
  popularity?: number;
  id?: string;
  active?: boolean;
  played?: boolean;
  playedTs?: string;
  userId?: string;
  spaceId?: string;
  userId: string;
};

declare type SpaceType = {
  id: string;
  name: string;
  createdAt: Date;
  createdBy: {
    name: string;
    image: string;
    email: string;
  };
  Stream: {
    id: string;
    bigImg: string;
  }[];
};

declare type StreamTypeApi = {
  id: string;
  type: string;
  url: string;
  extractedId: string;
  title: string;
  smallImg: string;
  bigImg: string;
  active: boolean;
  played: boolean;
  playedTs: string;
  createdAt: Date;
  userId: string;
  spaceId: string;
  popularity: number;
  Upvote: [];
  user: {
    name: string;
    email: string;
  };
};

declare type CurrentStream = {
  id: string;
  streamId: string;
  spaceId: string;
};

declare type SpaceStreamList = {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  Stream: StreamTypeApi[];
  CurrentStream: CurrentStream[];
  createdBy: { name: string; email: string };
};
