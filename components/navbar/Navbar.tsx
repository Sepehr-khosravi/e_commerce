"use client";

import { useState } from "react";
import Logo from "./Logo";
import NavLinks from "./NavLinks";
import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu";
import { Menu, X } from "lucide-react";
import { SearchBarWrapper } from "./SearchBarWrapper";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-100 w-full bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Main Navbar */}
        <div className="flex h-[72px] items-center justify-between">

          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <NavLinks />
          </div>

          {/* Desktop Right Section */}
          <div className="hidden items-center gap-3 lg:flex">
            <SearchBarWrapper />
            <UserMenu />
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 lg:hidden">

            {/* Search */}
            <SearchBarWrapper mobile />

            {/* Menu Button */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "بستن منو" : "باز کردن منو"}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-black transition-colors hover:bg-neutral-100 focus:outline-none"
            >
              {isOpen ? <X size={21} /> : <Menu size={21} />}
            </button>

          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`overflow-hidden transition-all duration-300 lg:hidden ${
            isOpen
              ? "max-h-[500px] pb-5 opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="border-t border-neutral-100 pt-4">

            <NavLinks mobile />

            <div className="mt-5">
              <UserMenu mobile />
            </div>

          </div>
        </div>

      </div>
    </header>
  );
}