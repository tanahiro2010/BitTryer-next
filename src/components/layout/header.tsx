"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderProps {
  login?: boolean;
}

export default function Header({ login }: HeaderProps) {
  const pathname = usePathname();
  const isProfilePage = pathname.includes("profile");

  return (
    <>
    <header className={`border-b py-3 px-5 flex justify-between items-center ${isProfilePage ? "hidden" : ""}`}>
      <h1 className="text-2xl font-bold">
        <Link href="/">Bittryer</Link>
      </h1>

      <div className="hidden md:block text-gray-600">
        暗号資産取引の経験をあなたに
      </div>

      <ul className="flex space-x-4">
        <li className="hover:underline hover:text-gray-800">
          { login ? <a href="/profile">Profile</a> : <a href="/login">Login</a> }
        </li>
      </ul>
    </header>

    {!isProfilePage && <div className="pb-5"></div>}
    </>
  );
}
