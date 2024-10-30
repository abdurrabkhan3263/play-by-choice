import { SpotifyApi } from "@types/spotify-api";

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: SpotifyApi;
    onYouTubeIframeAPIReady: () => void;
  }
}

declare type UpVoteType = {
  id?: string;
  streamId: string;
  userId: string;
};

declare type CreateStreamType = {
  url: string;
  extractedId: string;
  title: string;
  smallImg: string;
  bigImg: string;
  createdAt: Date;
  itemType?: StreamItemType;
  type: StreamType;
  listSongs?: CreateStreamType[];
  artists?: string;
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
    type: StreamType;
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
  itemType: string;
  played: boolean;
  playedTs: string;
  createdAt: Date;
  userId: string;
  spaceId: string;
  popularity: number;
  Upvote: UpVoteType[];
  listSongs?: StreamTypeApi[];
  user: {
    name: string;
    email: string;
    id: string;
  };
};

declare type CurrentStream = {
  id: string;
  streamId: string;
  spaceId: string;
  stream: {
    id: string;
    title: string;
    smallImg: string;
    popularity: number;
    url: string;
    artists: string;
    extractedId: string;
  };
  space: {
    createdBy: {
      id: string;
    };
  };
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

declare type FetchCurrentStream = {
  status: string;
  message: string;
  statusCode: number;
  isStreamAvailable: boolean;
  data?: CurrentStream;
};

// Props Types
declare type AudioProviderProps = {
  children: React.ReactNode;
  token: string;
  spaceId: string;
  isAllStreamPlayed: boolean;
  type: StreamType;
  currentStream: FetchCurrentStream;
  role: "OWNER" | "MEMBER";
};

declare type InsideSpaceProps = {
  streamList: SpaceStreamList;
  spaceId: string;
  spaceType: StreamType;
  currentStream: FetchCurrentStream;
  role: "OWNER" | "MEMBER";
};

declare type AddStreamBtnProps = {
  stream: CreateStreamType[] | StreamTypeApi[];
  setStream: React.Dispatch<React.SetStateAction<CreateStreamType[]>>;
  setStreamUrl: React.Dispatch<React.SetStateAction<string>>;
  streamUrl: string;
};

declare type toggleUpvote = {
  stream: StreamTypeApi;
  streamId: string;
  isUpVoted: boolean;
  setIsUpVoted: React.Dispatch<React.SetStateAction<boolean>>;
  setUpvoting: React.Dispatch<React.SetStateAction<boolean>>;
};

declare type handleDelete = {
  streamId: string;
  spaceId: string;
  setIsDeleting: React.Dispatch<React.SetStateAction<boolean>>;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

declare type CredentialType = "spotify" | "google";
declare type StreamType = "spotify" | "youtube";
declare type StreamItemType = "track" | "album" | "playlist";
