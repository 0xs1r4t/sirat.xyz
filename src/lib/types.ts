export type Song = {
  artist: string;
  albumImageUrl: string;
  isPlaying: boolean;
  songUrl: string;
  title: string;
  message: string;
};

export type Garden = {
  title: string;
  description: string;
  tags: string[];
  slug: string;
};
