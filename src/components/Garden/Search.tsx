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
        className="peer block bg-muted-100 border-2 border-muted-200 rounded-md focus:outline-none focus:border-2 focus:rounded-lg focus:border-muted-200 focus:ring-2 focus:ring-muted-200 focus:shadow-sm focus:shadow-muted-200 w-full self-stretch my-5 px-4 py-2 p-4 text-inherit"
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
