import { Suspense } from "react";
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense
      fallback={<div className="p-6 text-sm text-gray-500">Chargement…</div>}
    >
      <LoginClient />
    </Suspense>
  );
}