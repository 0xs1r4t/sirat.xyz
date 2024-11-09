"use client";

import React from "react";

import Link from "next/link";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";

import { Tooltip } from "@/components/Tooltip";
import { NeonPinkImageFilter } from "@/components/SVGFilters/Filters";

const refresh: number = 214400;

const Spotify = ({ song }: { song: Song | null }) => {
  if (song != null) {
    console.log(song.albumImageUrl);
    return (
      <Tooltip label="click to open this song in spotify" placement="bottom">
        <Link
          href={song.songUrl}
          target="_blank"
          className="flex flex-col items-center justify-center p-2"
        >
          <div className="rounded-md w-36 h-36 bg-muted-200 border-2 border-muted-200 z-30">
            {/* <Image
            src={song.albumImageUrl}
            alt="album cover"
            width={144}
            height={144}
            unoptimized={true}
            objectFit="cover"
            loading="lazy"
            className="rounded-md grayscale mix-blend-hard-light dark:mix-blend-luminosity z-40"
          /> */}
            <NeonPinkImageFilter
              url={song.albumImageUrl}
              alt="album cover"
              w={144}
              h={144}
              styles="rounded-md z-40"
            />
          </div>
          <span className="w-36 overflow-x-hidden">
            <p className="animate-marquee self-center text-nowrap text-sm lg:text-base whitespace-nowrap hover:animate-paused">
              {song.title} by {song.artist} {song.message}
            </p>
          </span>
        </Link>
      </Tooltip>
    );
  } else {
    return (
      <div className="flex flex-col items-center justify-center p-2">
        <div className="rounded-md w-36 h-36 bg-muted-200 border-2 border-muted-200 z-30">
          {/* <Image
            src="/assets/no-music-playing.webp"
            alt="album cover"
            width={144}
            height={144}
            unoptimized={true}
            objectFit="cover"
            loading="lazy"
            className="rounded-md grayscale contrast-75 mix-blend-hard-light dark:mix-blend-luminosity z-40"
          /> */}
          <NeonPinkImageFilter
            url="/assets/no-music-playing.webp"
            alt="no music is playing :("
            w={144}
            h={144}
            styles="rounded-md z-40"
          />
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
