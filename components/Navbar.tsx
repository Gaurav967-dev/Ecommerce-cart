"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  HomeIcon,
  LayoutGridIcon,
  CartIcon,
  MenuIcon,
  XIcon,
  HeartIcon,
} from "lucide-animated";

import { useShop } from "@/context/ShopContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const pathname = usePathname();

  const { wishlist, cart } = useShop();

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function isActive(path: string) {
    if (path === "/") {
      return pathname === "/";
    }

    return pathname === path || pathname.startsWith(`${path}/`);
  }

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link
            href="/"
            onClick={closeMenu}
            className="text-xl sm:text-2xl font-bold"
          >
            E-Commerce
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">

            <NavLink
              href="/"
              icon={<HomeIcon size={20} />}
              label="Home"
              active={isActive("/")}
            />

            <NavLink
              href="/shop"
              icon={<LayoutGridIcon size={20} />}
              label="Shop"
              active={isActive("/shop")}
            />

            <NavLink
              href="/cart"
              icon={<CartIcon size={20} />}
              label="Cart"
              count={cartCount}
              active={isActive("/cart")}
            />

            <NavLink
              href="/wishlist"
              icon={<HeartIcon size={20} />}
              label="Wishlist"
              count={wishlist.length}
              active={isActive("/wishlist")}
            />

          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() =>
              setIsMenuOpen((current) => !current)
            }
            className="md:hidden rounded-md p-2 hover:bg-gray-100 transition"
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? (
              <XIcon size={24} />
            ) : (
              <MenuIcon size={24} />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 border-t pt-4">
            <div className="flex flex-col gap-2">

              <MobileNavLink
                href="/"
                icon={<HomeIcon size={20} />}
                label="Home"
                active={isActive("/")}
                onClick={closeMenu}
              />

              <MobileNavLink
                href="/shop"
                icon={<LayoutGridIcon size={20} />}
                label="Shop"
                active={isActive("/shop")}
                onClick={closeMenu}
              />

              <MobileNavLink
                href="/cart"
                icon={<CartIcon size={20} />}
                label="Cart"
                count={cartCount}
                active={isActive("/cart")}
                onClick={closeMenu}
              />

              <MobileNavLink
                href="/wishlist"
                icon={<HeartIcon size={20} />}
                label="Wishlist"
                count={wishlist.length}
                active={isActive("/wishlist")}
                onClick={closeMenu}
              />

            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

/* =========================================
   DESKTOP NAV LINK
========================================= */

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  count?: number;
  active: boolean;
}

function NavLink({
  href,
  icon,
  label,
  count,
  active,
}: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`
        flex
        items-center
        gap-2
        rounded-lg
        px-3
        py-2
        text-sm
        font-medium
        transition
        ${
          active
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }
      `}
    >
      {icon}

      <span>{label}</span>

      {count !== undefined && count > 0 && (
        <span
          className={`
            rounded-full
            px-2
            py-0.5
            text-xs
            ${
              active
                ? "bg-primary-foreground text-primary"
                : "bg-primary text-primary-foreground"
            }
          `}
        >
          {count}
        </span>
      )}
    </Link>
  );
}

/* =========================================
   MOBILE NAV LINK
========================================= */

interface MobileNavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}

function MobileNavLink({
  href,
  icon,
  label,
  count,
  active,
  onClick,
}: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        flex
        items-center
        justify-between
        rounded-lg
        px-4
        py-3
        transition
        ${
          active
            ? "bg-primary text-primary-foreground"
            : "hover:bg-muted"
        }
      `}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>

      {count !== undefined && count > 0 && (
        <span
          className={`
            rounded-full
            px-2
            py-0.5
            text-xs
            ${
              active
                ? "bg-primary-foreground text-primary"
                : "bg-primary text-primary-foreground"
            }
          `}
        >
          {count}
        </span>
      )}
    </Link>
  );
}