"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";

const refresh: number = 216000;

const Spotify = ({ song }: { song: Song | null }) => {
  if (song != null) {
    console.log(song.albumImageUrl);
    return (
      <Link
        href={song.songUrl}
        target="_blank"
        className="flex flex-col items-center justify-center p-2"
      >
        <div className="rounded-md w-28 h-28 bg-muted-200 border-2 border-muted-200 z-30">
          <Image
            src={song.albumImageUrl}
            alt="album cover"
            width={112}
            height={112}
            unoptimized={true}
            objectFit="cover"
            loading="lazy"
            className="rounded-md grayscale contrast-75 mix-blend-luminosity z-40"
          />
        </div>
        <span className="w-28 overflow-x-hidden">
          <p className="animate-marquee self-center text-nowrap text-sm whitespace-nowrap hover:animate-paused">
            {song.title} by {song.artist} {song.message}
          </p>
        </span>
      </Link>
    );
  } else {
    return (
      <div className="flex flex-col items-center justify-center p-2">
        <div className="rounded-md w-28 h-28 bg-muted-200 border-2 border-muted-200 z-30">
          <Image
            src="https://i.giphy.com/FCYLrRJciiY6a1NdTD.webp"
            alt="album cover"
            width={112}
            height={112}
            unoptimized={true}
            objectFit="cover"
            loading="lazy"
            className="rounded-md grayscale contrast-75 mix-blend-luminosity z-40"
          />
        </div>
        <span className="w-28 overflow-x-hidden">
          <p className="animate-marquee self-center text-nowrap text-sm whitespace-nowrap hover:animate-paused">{`There is no song playing right now :(`}</p>
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
