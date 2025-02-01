"use client";

// most code is from here - https://nextjs.org/learn/dashboard-app/adding-search-and-pagination
// i also used the @tailwindcss/forms plugin for some simple style injection

import React, { FormEvent, useEffect, useState, useRef } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import * as motion from "motion/react-client";

const Search = ({ placeholder }: { placeholder: string }) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = useDebouncedCallback((content: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete("tag");

    if (content.trim()) {
      params.set("q", content);
    } else {
      params.delete("q");
    }

    replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl/Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    const input = inputRef.current;
    if (input) {
      input.addEventListener("focus", handleFocus);
      input.addEventListener("blur", handleBlur);
    }

    return () => {
      if (input) {
        input.removeEventListener("focus", handleFocus);
        input.removeEventListener("blur", handleBlur);
      }
    };
  }, []);

  return (
    <form className="relative flex flex-row" onSubmit={handleSubmit}>
      <motion.input
        ref={inputRef}
        type="text"
        className="peer block bg-muted-100 border-2 border-muted-200 rounded-md focus:outline-none focus:border-2 focus:rounded-lg focus:border-muted-200 focus:ring-2 focus:ring-muted-200 focus:shadow-sm focus:shadow-muted-200 placeholder:text-foreground placeholder:opacity-80 w-full self-stretch my-5 px-4 py-2 p-4 text-inherit"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get("q")?.toString()}
        animate={
          isFocused
            ? {
                scale: 1.05,
                y: [0, -1, 0],
                transition: {
                  y: {
                    repeat: Infinity,
                    duration: 1,
                    ease: "easeInOut",
                  },
                },
              }
            : {}
        }
      />
    </form>
  );
};

export default Search;
