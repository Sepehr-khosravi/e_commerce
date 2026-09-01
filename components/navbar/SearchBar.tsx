"use client";

import { Search } from "lucide-react";
import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

type SearchBarProps = {
  mobile?: boolean;
};

export default function SearchBar({
  mobile = false,
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const inputRef =
    useRef<HTMLInputElement>(null);

  const currentQuery =
    searchParams.get("q") || "";

  const [isOpen, setIsOpen] =
    useState(false);

  const [query, setQuery] =
    useState(currentQuery);

  /*
   * Sync input with URL
   */
  useEffect(() => {
    setQuery(currentQuery);
  }, [currentQuery]);

  /*
   * Focus input whenever mobile search opens
   */
  useEffect(() => {
    if (!mobile || !isOpen) return;

    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    return () => clearTimeout(timeout);
  }, [isOpen, mobile]);

  /*
   * Search
   *
   * IMPORTANT:
   * Search is ONLY triggered by form submit.
   * Clicking the search icon never searches.
   */
  const handleSearch = () => {
    const value = query.trim();

    if (!value) {
      return;
    }

    router.push(
      `/search?q=${encodeURIComponent(value)}`
    );

    /*
     * Close after searching on mobile.
     */
    if (mobile) {
      setIsOpen(false);
    }
  };

  /*
   * Form submit
   *
   * Pressing Enter triggers this.
   */
  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    handleSearch();
  };

  /*
   * Open mobile search
   *
   * This function NEVER performs a search.
   */
  const openSearch = () => {
    setIsOpen(true);

    /*
     * Focus immediately as well.
     * The useEffect above handles the case
     * where the input isn't mounted yet.
     */
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  /*
   * =========================
   * MOBILE
   * =========================
   */

  if (mobile) {
    return (
      <form
        onSubmit={handleSubmit}
        className={`
          relative
          flex
          h-9
          items-center
          rounded-lg
          bg-neutral-50
          transition-[width]
          duration-300
          ease-out

          ${
            isOpen
              ? "w-[min(11rem,calc(100vw-5.5rem))]"
              : "w-9"
          }
        `}
      >
        {/* Search icon */}
        <button
          type="button"
          onClick={openSearch}
          aria-label="باز کردن جستجو"
          className="
            absolute
            left-0
            top-0
            z-20
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg
            text-neutral-600
            transition-all
            duration-200
            hover:text-black
            focus:outline-none
            active:scale-95
          "
        >
          <Search
            size={17}
            className="
              transition-transform
              duration-200
            "
          />
        </button>

        {/* Input */}
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="جستجو..."
          autoComplete="off"
          className={`
            h-full
            w-full
            min-w-0
            border-0
            bg-transparent
            pl-9
            pr-2
            text-xs
            font-medium
            text-black
            outline-none
            ring-0
            placeholder:text-neutral-400
            focus:border-0
            focus:outline-none
            focus:ring-0

            ${
              isOpen
                ? "opacity-100"
                : "pointer-events-none opacity-0"
            }
          `}
        />
      </form>
    );
  }

  /*
   * =========================
   * DESKTOP
   * =========================
   */

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-48 xl:w-56"
    >
      <Search
        size={17}
        className="
          pointer-events-none
          absolute
          left-3
          top-1/2
          -translate-y-1/2
          text-neutral-400
        "
      />

      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) =>
          setQuery(event.target.value)
        }
        placeholder="جستجو..."
        autoComplete="off"
        className="
          h-10
          w-full
          rounded-xl
          border-0
          bg-neutral-50
          pl-10
          pr-4
          text-sm
          font-medium
          text-black
          outline-none
          ring-0
          transition-all
          duration-200
          placeholder:text-neutral-400
          hover:bg-neutral-100
          focus:bg-neutral-100
          focus:border-0
          focus:outline-none
          focus:ring-0
        "
      />
    </form>
  );
}