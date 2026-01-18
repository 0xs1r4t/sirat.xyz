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

  export interface PostMetadata {
    slug: string;
    title: string;
    description: string;
    tags: string[];
    type: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }

  export interface Post extends PostMetadata {
    content: string;
    html: string;
    toc: string;
  }
}
