"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/login", { method: "DELETE" });
    router.refresh();
  }
  return (
    <button onClick={logout} className="label hover:text-ink">
      Sair
    </button>
  );
}
