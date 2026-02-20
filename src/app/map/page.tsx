"use client";

import dynamic from "next/dynamic";
import RequireAuth from "@/components/RequireAuth";

const MapClientPage = dynamic(() => import("./MapClientPage"), { ssr: false });

export default function Page() {
  return (
    <RequireAuth>
      <MapClientPage />
    </RequireAuth>
  );
}
