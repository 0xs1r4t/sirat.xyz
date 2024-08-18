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
        className="peer bg-muted-100 border-muted-200 focus:outline-none focus:border-fuchsia-500 focus:ring-fuchsia-500 focus:ring-1 caret-fuchsia-500 block w-full self-stretch my-5 px-4 py-2 p-4 text-inherit rounded-md border-2"
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
