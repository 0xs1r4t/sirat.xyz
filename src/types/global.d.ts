export {};

declare global {
  type Song = {
    artist: string;
    albumImageUrl: string;
    songUrl: string;
    title: string;
    message?: string;
    isPlaying?: boolean;
  };

  type PostSummary = {
    slug: string;
    title: string;
    description: string;
    tags: string[];
    type: string;
    createdAt?: string;
    updatedAt?: string;
  };

  type Post = PostSummary & {
    html: string;
  };
}
