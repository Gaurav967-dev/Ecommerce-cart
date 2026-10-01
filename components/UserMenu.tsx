"use client";

import Link from "next/link";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import { useRouter } from "next/navigation";

import {
    BoxIcon,
    ChevronDownIcon,
    LayoutGridIcon,
    LogoutIcon,
    UserIcon,
} from "lucide-animated";

import { useAuth } from "@/components/AuthProvider";

export default function UserMenu() {
    const {
        user,
        logout,
    } = useAuth();

    const router =
        useRouter();

    const [
        isOpen,
        setIsOpen,
    ] = useState(false);

    const [
        signingOut,
        setSigningOut,
    ] = useState(false);

    const menuRef =
        useRef<HTMLDivElement | null>(
            null
        );


    // Close dropdown when clicking outside
    useEffect(() => {
        function handleOutsideClick(
            event: PointerEvent
        ) {
            if (
                menuRef.current &&
                !menuRef.current.contains(
                    event.target as Node
                )
            ) {
                setIsOpen(false);
            }
        }

        document.addEventListener(
            "pointerdown",
            handleOutsideClick
        );

        return () => {
            document.removeEventListener(
                "pointerdown",
                handleOutsideClick
            );
        };
    }, []);


    // Close dropdown with Escape
    useEffect(() => {
        function handleEscape(
            event: KeyboardEvent
        ) {
            if (
                event.key ===
                "Escape"
            ) {
                setIsOpen(false);
            }
        }

        document.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {
            document.removeEventListener(
                "keydown",
                handleEscape
            );
        };
    }, []);


    if (!user) {
        return null;
    }


    async function handleLogout() {
        if (signingOut) {
            return;
        }

        setSigningOut(true);

        // Close menu immediately
        setIsOpen(false);

        try {
            await logout();

            router.replace("/");
            router.refresh();
        } finally {
            setSigningOut(false);
        }
    }


    function closeMenu() {
        setIsOpen(false);
    }


    return (
        <div
            ref={menuRef}
            className="relative"
        >

            {/* TRIGGER */}

            <button
                type="button"
                onClick={() =>
                    setIsOpen(
                        (current) =>
                            !current
                    )
                }
                aria-haspopup="menu"
                aria-expanded={
                    isOpen
                }
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-muted"
            >
                <UserIcon
                    className="h-5 w-5"
                />

                <span>
                    Hi,{" "}
                    {user.name ||
                        "User"}
                </span>

                <ChevronDownIcon
                    className={`h-5 w-5 transition-transform duration-300 ${isOpen
                            ? "rotate-180"
                            : ""
                        }`}
                />
            </button>


            {/* DROPDOWN */}

            {isOpen && (
                <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border bg-white shadow-xl"
                >

                    {/* ACCOUNT */}

                    <Link
                        href="/account"
                        onClick={
                            closeMenu
                        }
                        className="group flex items-center gap-3 border-b px-4 py-3 transition hover:bg-muted"
                    >
                        <LayoutGridIcon
                            size={20}
                        />

                        <div>
                            <p className="text-sm font-medium">
                                My Account
                            </p>

                            <p className="text-xs text-gray-400">
                                Account overview
                            </p>
                        </div>
                    </Link>


                    {/* PROFILE */}

                    <Link
                        href="/profile"
                        onClick={
                            closeMenu
                        }
                        className="group flex items-center gap-3 px-4 py-3 transition hover:bg-muted"
                    >
                        <UserIcon
                            size={20}
                        />

                        <span className="text-sm font-medium">
                            Profile
                        </span>
                    </Link>


                    {/* ORDERS */}

                    <Link
                        href="/orders"
                        onClick={
                            closeMenu
                        }
                        className="group flex items-center gap-3 px-4 py-3 transition hover:bg-muted"
                    >
                        <BoxIcon
                            size={20}
                        />

                        <span className="text-sm font-medium">
                            Orders
                        </span>
                    </Link>


                    {/* SIGN OUT */}

                    <div className="border-t">
                        <button
                            type="button"
                            onClick={
                                handleLogout
                            }
                            disabled={
                                signingOut
                            }
                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <LogoutIcon
                                size={20}
                            />

                            <span>
                                {signingOut
                                    ? "Signing out..."
                                    : "Sign Out"}
                            </span>
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
}