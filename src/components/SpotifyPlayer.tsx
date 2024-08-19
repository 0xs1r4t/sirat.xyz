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
        <Image
          src={song.albumImageUrl}
          alt="album cover"
          width={112}
          height={112}
        />
        <span className="text-wrap w-28 text-sm">
          {song.title} by {song.artist} {song.message}
        </span>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col items-center justify-center p-2">
        <Image
          src="https://i.giphy.com/FCYLrRJciiY6a1NdTD.webp"
          alt="album cover"
          width={112}
          height={112}
          unoptimized
        />
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
