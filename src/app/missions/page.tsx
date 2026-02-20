"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import RequireAuth from "@/components/RequireAuth";

type Mission = {
  id: string;
  title: string;
  description: string | null;
  city: string | null;
  starts_at: string | null;
  organizations?: { name: string }[]; // <= tableau
};

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("missions")
        .select(
          `
          id,
          title,
          description,
          city,
          starts_at,
          organizations(name)
        `
        )
        .order("starts_at", { ascending: true });

      setMissions((data ?? []) as unknown as Mission[]);
      setLoading(false);
    };

    load();
  }, []);

  return (
    <RequireAuth>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Missions bénévoles</h1>

        {loading && <div className="text-sm text-gray-500">Chargement…</div>}

        {!loading && missions.length === 0 && (
          <div className="rounded-xl bg-white p-6 text-sm text-gray-500 shadow-sm">
            Aucune mission pour le moment.
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {missions.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-semibold">{m.title}</h2>
                <span className="rounded-md bg-gray-100 px-2 py-1 text-xs">
                  {m.city}
                </span>
              </div>

              <div className="mt-2 text-xs text-gray-500">
                {m.organizations?.[0]?.name ?? "Association inconnue"}
              </div>

              {m.starts_at && (
                <div className="mt-1 text-xs text-gray-500">
                  📅 {new Date(m.starts_at).toLocaleString()}
                </div>
              )}

              {m.description && (
                <p className="mt-3 text-sm text-gray-700 line-clamp-3">
                  {m.description}
                </p>
              )}

              <div className="mt-4 flex gap-2">
                <button className="rounded-lg bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-800">
                  Je suis intéressé
                </button>

                <a
                  href="/map"
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
                >
                  Voir sur la carte
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RequireAuth>
  );
}