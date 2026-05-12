"use client";

import Link from "next/link";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import { Tooltip } from "@/components/Tooltip";
import { Filters } from "@/components/Filters";
import DitherImage from "@graphics/Dither/DitherImage";

const REFRESH_INTERVAL = 214400;
const ALBUM_SIZE = 144;

// Spotify card: fetches song data and renders Spotify component

const AlbumArt = ({
  src,
  alt,
  pattern,
}: {
  src: string;
  alt: string;
  pattern: "4x4" | "8x8";
}) => (
  <div className="rounded-md w-36 h-36 bg-muted-200 border-2 border-muted-200 z-30 overflow-hidden">
    <DitherImage
      src={src}
      alt={alt}
      width={ALBUM_SIZE}
      height={ALBUM_SIZE}
      pattern={pattern}
      intensity={1.0}
      useTint={true}
      className="GradientMap rounded-md z-40"
    />
    <Filters />
  </div>
);

const Spotify = ({ song }: { song: Song | null }) => {
  if (song) {
    return (
      <Tooltip label="click to open this song in spotify" placement="right">
        <Link
          href={song.songUrl}
          target="_blank"
          className="flex flex-col items-center justify-center p-2"
        >
          <AlbumArt
            src={song.albumImageUrl}
            alt={`${song.title} album cover`}
            pattern="8x8"
          />
          <span className="w-36 overflow-x-hidden relative">
            <div className="whitespace-nowrap inline-block animate-marquee text-sm lg:text-base hover:animate-paused">
              {song.title} by {song.artist} {song.message}
            </div>
          </span>
        </Link>
      </Tooltip>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <AlbumArt
        src="/images/no-music-playing.webp"
        alt="no music is playing :("
        pattern="4x4"
      />
      <span className="w-36 overflow-x-hidden">
        <p className="w-32 animate-marquee self-center text-nowrap text-sm lg:text-base whitespace-nowrap hover:animate-paused">
          There is no song playing right now :(
        </p>
      </span>
    </div>
  );
};

// SpotifyPlayer: fetches song data and renders Spotify component

const SpotifyPlayer = () => {
  const { data: recentSong } = useSWR("/api/spotify/recently-played", fetcher, {
    refreshInterval: REFRESH_INTERVAL,
  }) as { data: Song | undefined };
  const { data: currentSong } = useSWR(
    "/api/spotify/currently-playing",
    fetcher,
    { refreshInterval: REFRESH_INTERVAL },
  ) as { data: Song | undefined };

  const song: Song | null =
    recentSong && currentSong
      ? currentSong.isPlaying
        ? currentSong
        : recentSong
      : null;

  return <Spotify song={song} />;
};

export default SpotifyPlayer;
