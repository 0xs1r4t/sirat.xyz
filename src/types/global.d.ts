export {};

declare global {
  type Song = {
    artist: string;
    albumImageUrl: string;
    isPlaying: boolean;
    songUrl: string;
    title: string;
    message: string;
  };

  type PostSummary = {
    title: string;
    description: string;
    tags: string[];
    slug: string;
    created_at: string;
    updated_at: string;
  };

  type Post = {
    title: string;
    description: string;
    tags: string[];
    html: string;
    created_at: string;
    updated_at: string;
  };
}
