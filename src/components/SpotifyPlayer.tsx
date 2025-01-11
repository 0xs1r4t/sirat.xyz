"use client";

import React from "react";

import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";

import { Tooltip } from "@/components/Tooltip";
import { Filters } from "@/components/Filters";

const refresh: number = 214400;

interface SpotifyProps {
  song: Song | null;
}

const Spotify = ({ song }: SpotifyProps) => {
  if (song != null) {
    console.log(song.albumImageUrl);
    return (
      <Tooltip label="click to open this song in spotify" placement="right">
        <Link
          href={song.songUrl}
          target="_blank"
          className="flex flex-col items-center justify-center p-2"
        >
          <div className="rounded-md w-36 h-36 bg-muted-200 border-2 border-muted-200 z-30">
            <Image
              src={song.albumImageUrl}
              alt={`album cover`}
              height={144}
              width={144}
              className="GradientMap rounded-md z-40"
              unoptimized={false}
              loading="lazy"
              style={{ objectFit: "cover" }}
            />
            <Filters />
          </div>
          <span className="w-36 overflow-x-hidden relative">
            <div className="whitespace-nowrap inline-block animate-marquee text-sm lg:text-base hover:animate-paused">
              {song.title} by {song.artist} {song.message}
            </div>
          </span>
        </Link>
      </Tooltip>
    );
  } else {
    return (
      <div className="flex flex-col items-center justify-center p-2">
        <div className="rounded-md w-36 h-36 bg-muted-200 border-2 border-muted-200 z-30">
          <Image
            src="/images/no-music-playing.webp"
            alt="no music is playing :("
            height={144}
            width={144}
            className={`GradientMap rounded-md z-40`}
            loading="lazy"
            style={{ objectFit: "cover" }}
          />
          <Filters />
        </div>
        <span className="w-36 overflow-x-hidden">
          <p className="animate-marquee self-center text-nowrap text-sm lg:text-base whitespace-nowrap hover:animate-paused">{`There is no song playing right now :(`}</p>
        </span>
      </div>
    );
  }
};

const SpotifyPlayer = () => {
  const { data: recentSong } = useSWR("/api/spotify/recently-played", fetcher, {
    refreshInterval: refresh,
  }) as { data: Song | undefined };

  const { data: currentSong } = useSWR(
    "/api/spotify/currently-playing",
    fetcher,
    { refreshInterval: refresh }
  ) as { data: Song | undefined };

  var song: Song | null;
  if (recentSong && currentSong) {
    currentSong.isPlaying ? (song = currentSong) : (song = recentSong);
  } else {
    song = null;
  }

  return (
    <div>
      <Spotify song={song} />
    </div>
  );
};

export default SpotifyPlayer;
