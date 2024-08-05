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
      <div className="flex flex-col items-center justify-center">
        <Image
          src={song.albumImageUrl}
          alt="album cover"
          width={150}
          height={150}
        />
        <span>
          {song.title} by {song.artist} {song.message}
        </span>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col items-center justify-center">
        <Image
          src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZHM4c3pqZmdrd2J3b2EwcG0wNnB6dW5yZXlmdDk4anFqaW11dWt0OSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/njLGU6UWncDC1o7QX3/giphy.webp"
          alt="album cover"
          width={150}
          height={150}
          unoptimized
        />
        <span>{`There is no song playing right now :(`}</span>
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
