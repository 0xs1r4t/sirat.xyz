declare global {
  type Song = {
    artist: string;
    albumImageUrl: string;
    songUrl: string;
    title: string;
    message?: string;
    isPlaying?: boolean;
  };

  interface PostMetadata {
    slug: string;
    title: string;
    description: string;
    tags: string[];
    type: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }

  interface Post extends PostMetadata {
    content: string;
    html: string;
    toc: string;
  }
}

export {};
