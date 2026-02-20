"use client";

import dynamic from "next/dynamic";

const MapClientPage = dynamic(() => import("./MapClientPage"), { ssr: false });

export default function Page() {
  return <MapClientPage />;
}