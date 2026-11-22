import React from "react";
import Link from "next/link";
import { getPublishedPosts } from "@/lib/markdown";
import type { GardenPost } from "@/lib/garden/meadow";
import Garden from "@graphics/Garden/Garden";

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
      {/* Keyboard/screen-reader equivalent of the garden: hidden until a link
          inside it receives focus, then shown as an overlay. The canvas is
          aria-hidden and pointer-only, so this is the accessible way in. */}
      <section
        aria-labelledby="home-posts-title"
        className="home-posts"
      >
        <h1 id="home-title" className="text-2xl font-bold">
          Sirat Baweja
        </h1>
        <h2 id="home-posts-title" className="mt-3 text-xl font-bold">
          Recent garden posts
        </h2>
        <ul className="mt-2 list-disc pl-5">
          {gardenPosts.map((post) => (
            <li key={post.slug}>
              <Link className="underline" href={`/garden/${post.slug}`}>
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <Garden posts={gardenPosts} />
      {/* <p>
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
      </p> */}
      {/* <p>
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
      </p> */}
      {/* <IntroCard /> */}
    </div>
  );
};

export default Home;
