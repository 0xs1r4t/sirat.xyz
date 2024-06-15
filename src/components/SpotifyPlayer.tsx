"use client";

import React from "react";
import Image from "next/image";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import { type Song } from "@/lib/types";

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
    return <div>{`No song is playing :(`}</div>;
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
