"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import SpotifyPlayer from "@/components/SpotifyPlayer";

const Sidebar = () => {
  return (
    <motion.div
      aria-label="sidebar"
      className="fixed flex flex-col items-center justify-between top-10 left-2 p-2 mx-1 z-20 min-w-40 max-w-52 min-h-96 max-h-[90%] bg-muted-100 border-2 border-muted-200 rounded-lg overflow-y-scroll"
    >
      <SpotifyPlayer />
      <div className="flex flex-col">
        <p>
          <Link
            aria-label="home"
            href="/"
            className="cursor-pointer hover:bg-muted-200 hover:rounded-md px-1 py-0.5"
          >
            <span aria-hidden="true">{"🏡 "}</span>
            home
          </Link>
        </p>{" "}
        <p>
          <Link
            aria-label="garden"
            href="/garden"
            className="cursor-pointer hover:bg-muted-200 hover:rounded-md px-1 py-0.5"
          >
            <span aria-hidden="true">{"🌼 "}</span>
            garden
          </Link>
        </p>{" "}
        <p>
          <Link
            aria-label="graphics"
            href="/graphics"
            className="cursor-pointer hover:bg-muted-200 hover:rounded-md px-1 py-0.5"
          >
            <span aria-hidden="true">{"🎨 "}</span>graphics
          </Link>{" "}
        </p>
      </div>
    </motion.div>
  );
};

export default Sidebar;
