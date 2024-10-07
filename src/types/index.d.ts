import { StreamType } from "@prisma/client";

declare type CreateStreamType = {
  url: string;
  extractedId: string;
  title: string;
  smallImg: string;
  bigImg: string;
  createdAt: Date;
  type: StreamType;
};
