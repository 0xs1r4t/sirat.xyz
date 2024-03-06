"use client";

// most code is from here - https://nextjs.org/learn/dashboard-app/adding-search-and-pagination
// i also used the @tailwindcss/forms plugin for some simple style injection

import React from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

const Search = ({ placeholder }: { placeholder: string }) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((content: string) => {
    const params = new URLSearchParams(searchParams);
    console.log(`searching for content with ${content}...`);

    if (content) {
      params.set("q", content);
    } else {
      params.delete("q");
    }

    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <form className="relative flex flex-row">
      <input
        type="text"
        className="peer block w-full ring-blue-100 self-stretch my-5 px-4 py-2 border-neutral-400/10 bg-neutral-100 p-4 dark:bg-neutral-900 text-black dark:text-white rounded-md border-2"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get("q")?.toString()}
      />
    </form>
  );
};

export default Search;
