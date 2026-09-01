"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { Search, X } from "lucide-react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

type SearchInputProps = {
  mobile?: boolean;
};

export default function SearchInput({
  mobile = false,
}: SearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(urlQuery);

  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const value = query.trim();

    console.log("SEARCH:", value);

    if (!value) {
      return;
    }

    router.push(
      `/search?q=${encodeURIComponent(value)}`
    );
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();

      const value = query.trim();

      console.log("ENTER SEARCH:", value);

      if (!value) {
        return;
      }

      router.push(
        `/search?q=${encodeURIComponent(value)}`
      );
    }
  };

  const clearSearch = () => {
    setQuery("");

    if (pathname === "/search") {
      router.push("/search");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`group relative ${
        mobile
          ? "w-full"
          : "w-full max-w-sm"
      }`}
    >
      <Search
        size={18}
        className="
          pointer-events-none
          absolute
          right-4
          top-1/2
          z-10
          -translate-y-1/2
          text-neutral-400
          transition-all
          duration-300
          group-focus-within:text-black
        "
      />

      <input
        type="search"
        value={query}
        onChange={(event) =>
          setQuery(event.target.value)
        }
        onKeyDown={handleKeyDown}
        placeholder="جستجوی محصولات..."
        autoComplete="off"
        className="
          h-11
          w-full
          rounded-xl
          border-0
          bg-neutral-100
          px-11
          text-sm
          font-medium
          text-black
          outline-none
          ring-0
          transition-all
          duration-300
          placeholder:text-neutral-400
          hover:bg-neutral-50
          focus:bg-neutral-50
          focus:outline-none
          focus:ring-0
        "
      />

      {query && (
        <button
          type="button"
          onClick={clearSearch}
          className="
            absolute
            left-3
            top-1/2
            z-10
            flex
            h-7
            w-7
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            text-neutral-400
            transition-all
            duration-200
            hover:bg-neutral-200
            hover:text-black
            focus:outline-none
          "
        >
          <X size={14} />
        </button>
      )}
    </form>
  );
}