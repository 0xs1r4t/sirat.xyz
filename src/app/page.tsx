import React from "react";
import Link from "next/link";
import { getPublishedPosts } from "@/lib/markdown";
import type { GardenPost } from "@/lib/garden/meadow";
import Garden from "@graphics/Garden/Garden";
import IntroCard from "@/components/Landing/IntroCard";
import { Icons } from "@/components/Icons";

const Home = async () => {
  const posts = await getPublishedPosts();

  // Only the serializable fields the garden needs cross to the client.
  const gardenPosts: GardenPost[] = posts.map(
    ({ slug, title, description, tags, createdAt, status }) => ({
      slug,
      title,
      description,
      tags,
      createdAt,
      status,
    }),
  );

  return (
    <div className="flex flex-col items-center justify-center h-[75vh]">
      <Garden posts={gardenPosts} />
      <p>
        <Link
          aria-label="garden"
          href="/garden"
          className="cursor-pointer flex flex-nowrap items-center text-lg lg:text-xl hover:bg-muted-100 hover:rounded-md px-1 py-0.5"
        >
          <span aria-hidden="true">
            <Icons.digiGarden size={22} />
          </span>
          &nbsp;digital garden
        </Link>{" "}
      </p>
      <p>
        <Link
          aria-label="graphics"
          href="/graphics"
          className="cursor-pointer flex flex-nowrap items-center text-lg lg:text-xl hover:bg-muted-100 hover:rounded-md px-1 py-0.5"
        >
          <span aria-hidden="true">
            <Icons.palette size={22} />
          </span>
          &nbsp;visual experiments
        </Link>{" "}
      </p>
      {/* <IntroCard /> */}
    </div>
  );
};

export default Home;
