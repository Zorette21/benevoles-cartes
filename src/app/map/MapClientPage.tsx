"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import MapView from "@/components/MapView";

type Mission = {
  id: string;
  title: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  starts_at: string | null;
};

export default function MapClientPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("missions")
        .select("id,title,city,lat,lng,starts_at")
        .order("starts_at", { ascending: true });

      if (!error) setMissions((data ?? []) as Mission[]);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Carte des missions</h1>
        <p className="text-sm text-gray-600">
          {loading ? "Chargement..." : `${missions.filter((m) => m.lat && m.lng).length} mission(s) géolocalisée(s)`}
        </p>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <MapView missions={missions} />
      </div>
    </div>
  );
}