"use client";

import React from "react";
import Image from "next/image";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";

const refresh: number = 216000;

const Spotify = ({ song }: { song: Song | null }) => {
  if (song != null) {
    console.log(song.albumImageUrl);
    return (
      <div className="flex flex-col items-center justify-center p-2">
        <div className="rounded-md w-[112px] h-[112px] bg-bright-100 dark:bg-muted-200 border-2 border-muted-200 z-30">
          <Image
            src={song.albumImageUrl}
            alt="album cover"
            width={112}
            height={112}
            unoptimized={true}
            objectFit="cover"
            loading="lazy"
            className="rounded-md mix-blend-screen dark:mix-blend-luminosity opacity-75 dark:opacity-100 z-40"
          />
        </div>
        <span className="text-wrap w-28 text-sm">
          {song.title} by {song.artist} {song.message}
        </span>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col items-center justify-center p-2">
        <div className="rounded-md w-[112px] h-[112px] bg-bright-100 dark:bg-muted-200 border-2 border-muted-200 z-30">
          <Image
            src="https://i.giphy.com/FCYLrRJciiY6a1NdTD.webp"
            alt="album cover"
            width={112}
            height={112}
            unoptimized={true}
            objectFit="cover"
            loading="lazy"
            className="rounded-md mix-blend-screen dark:mix-blend-luminosity opacity-75 dark:opacity-100 z-40"
          />
        </div>
        <span className="text-wrap w-28 text-sm">{`There is no song playing right now :(`}</span>
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
