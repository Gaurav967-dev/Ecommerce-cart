"use client";

import { useState } from "react";
import Link from "next/link";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  HomeIcon,
  LayoutGridIcon,
  CartIcon,
  MenuIcon,
  XIcon,
  HeartIcon,
} from "lucide-animated";

import { Search } from "lucide-react";

import { useShop } from "@/context/ShopContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { wishlist, cart } = useShop();

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const activeCategory =
    searchParams.get("category") || "";

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function isActive(path: string) {
    if (path === "/") {
      return pathname === "/";
    }

    return (
      pathname === path ||
      pathname.startsWith(`${path}/`)
    );
  }

  function isCategoryActive(category: string) {
    return (
      pathname === "/shop" &&
      activeCategory.toLowerCase() ===
        category.toLowerCase()
    );
  }

  function handleSearchSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const value = search.trim();

    if (!value) {
      router.push("/shop");
      setIsMenuOpen(false);
      return;
    }

    router.push(
      `/shop?search=${encodeURIComponent(value)}`
    );

    setIsMenuOpen(false);
  }

  return (
    <>
      {/* =========================================
          ANNOUNCEMENT BAR
      ========================================== */}

      <div className="bg-black text-white text-center text-xs sm:text-sm py-2 px-4">
        Free shipping on orders above ₹999
      </div>

      {/* =========================================
          HEADER
      ========================================== */}

      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* =====================================
              MAIN HEADER
          ====================================== */}

          <div className="h-20 flex items-center justify-between gap-4">

            {/* Logo */}
            <Link
              href="/"
              onClick={closeMenu}
              className="
                shrink-0
                text-xl
                sm:text-2xl
                lg:text-3xl
                font-bold
                tracking-tight
              "
            >
              E-Commerce
            </Link>

            {/* Desktop Search */}
            <form
              onSubmit={handleSearchSubmit}
              className="
                hidden
                lg:flex
                flex-1
                max-w-xl
                mx-6
              "
            >
              <div className="relative w-full">
                <Search
                  size={18}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-muted-foreground
                  "
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search products..."
                  className="
                    w-full
                    rounded-full
                    border
                    bg-muted/30
                    py-3
                    pl-11
                    pr-4
                    text-sm
                    outline-none
                    transition
                    focus:border-primary
                    focus:bg-background
                  "
                />
              </div>
            </form>

            {/* Desktop Cart + Wishlist */}
            <div className="hidden md:flex items-center gap-2">
              <HeaderAction
                href="/cart"
                icon={<CartIcon size={22} />}
                label="Cart"
                count={cartCount}
                active={isActive("/cart")}
              />

              <HeaderAction
                href="/wishlist"
                icon={<HeartIcon size={22} />}
                label="Wishlist"
                count={wishlist.length}
                active={isActive("/wishlist")}
              />
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() =>
                setIsMenuOpen(
                  (current) => !current
                )
              }
              className="
                md:hidden
                rounded-full
                border
                p-2
                hover:bg-muted
                transition
              "
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? (
                <XIcon size={22} />
              ) : (
                <MenuIcon size={22} />
              )}
            </button>
          </div>

          {/* =====================================
              DESKTOP NAVIGATION
          ====================================== */}

          <nav className="hidden md:flex items-center justify-center gap-2 pb-4">

            <NavLink
              href="/"
              icon={<HomeIcon size={18} />}
              label="Home"
              active={isActive("/")}
            />

            <NavLink
              href="/shop"
              icon={<LayoutGridIcon size={18} />}
              label="Shop"
              active={
                isActive("/shop") &&
                !activeCategory
              }
            />

            <NavLink
              href="/shop?category=Electronics"
              label="Electronics"
              active={isCategoryActive(
                "Electronics"
              )}
            />

            <NavLink
              href="/shop?category=Shoes"
              label="Shoes"
              active={isCategoryActive("Shoes")}
            />

            <NavLink
              href="/shop?category=Accessories"
              label="Accessories"
              active={isCategoryActive(
                "Accessories"
              )}
            />

            <NavLink
              href="/wishlist"
              icon={<HeartIcon size={18} />}
              label="Wishlist"
              count={wishlist.length}
              active={isActive("/wishlist")}
            />

            <NavLink
              href="/cart"
              icon={<CartIcon size={18} />}
              label="Cart"
              count={cartCount}
              active={isActive("/cart")}
            />
          </nav>

          {/* =====================================
              MOBILE MENU
          ====================================== */}

          {isMenuOpen && (
            <div className="md:hidden border-t py-4">

              {/* Mobile Search */}
              <form
                onSubmit={handleSearchSubmit}
                className="mb-4"
              >
                <div className="relative">
                  <Search
                    size={18}
                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-muted-foreground
                    "
                  />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search products..."
                    className="
                      w-full
                      rounded-full
                      border
                      bg-muted/30
                      py-3
                      pl-11
                      pr-4
                      text-sm
                      outline-none
                      focus:border-primary
                    "
                  />
                </div>
              </form>

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
                  active={
                    isActive("/shop") &&
                    !activeCategory
                  }
                  onClick={closeMenu}
                />

                <MobileNavLink
                  href="/shop?category=Electronics"
                  label="Electronics"
                  active={isCategoryActive(
                    "Electronics"
                  )}
                  onClick={closeMenu}
                />

                <MobileNavLink
                  href="/shop?category=Shoes"
                  label="Shoes"
                  active={isCategoryActive("Shoes")}
                  onClick={closeMenu}
                />

                <MobileNavLink
                  href="/shop?category=Accessories"
                  label="Accessories"
                  active={isCategoryActive(
                    "Accessories"
                  )}
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

                <MobileNavLink
                  href="/cart"
                  icon={<CartIcon size={20} />}
                  label="Cart"
                  count={cartCount}
                  active={isActive("/cart")}
                  onClick={closeMenu}
                />
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}

/* =========================================
   DESKTOP HEADER ACTION
========================================= */

interface HeaderActionProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  count?: number;
  active: boolean;
}

function HeaderAction({
  href,
  icon,
  label,
  count,
  active,
}: HeaderActionProps) {
  return (
    <Link
      href={href}
      className={`
        flex
        items-center
        gap-2
        rounded-full
        px-4
        py-2
        text-sm
        transition
        ${
          active
            ? "bg-primary text-primary-foreground"
            : "hover:bg-muted"
        }
      `}
    >
      {icon}

      <span>{label}</span>

      {count !== undefined && count > 0 && (
        <span
          className={`
            min-w-5
            h-5
            rounded-full
            text-xs
            flex
            items-center
            justify-center
            px-1
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
   DESKTOP NAV LINK
========================================= */

interface NavLinkProps {
  href: string;
  icon?: React.ReactNode;
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
        rounded-full
        px-4
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
  icon?: React.ReactNode;
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
        rounded-xl
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
          className="
            min-w-5
            h-5
            rounded-full
            bg-primary
            text-primary-foreground
            text-xs
            flex
            items-center
            justify-center
            px-1
          "
        >
          {count}
        </span>
      )}
    </Link>
  );
}