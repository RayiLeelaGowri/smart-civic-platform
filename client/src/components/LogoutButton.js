"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("smart_civic_token");
    localStorage.removeItem("smart_civic_user");

    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-lg border border-red-400 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500 hover:text-white"
    >
      Logout
    </button>
  );
}