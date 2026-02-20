"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Org = { id: string; name: string };
type Mission = {
  id: string;
  title: string;
  city: string;
  starts_at: string | null;
  lat: number | null;
  lng: number | null;
};

export default function OrgPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [orgs, setOrgs] = useState<Org[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");

  const [title, setTitle] = useState("");
  const [city, setCity] = useState("Perpignan");
  const [startsAt, setStartsAt] = useState("");
  const [description, setDescription] = useState("");

  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const [missions, setMissions] = useState<Mission[]>([]);
  const selectedOrgName = useMemo(
    () => orgs.find((o) => o.id === selectedOrgId)?.name ?? "",
    [orgs, selectedOrgId]
  );

  useEffect(() => {
    const load = async () => {
      // user
      const { data: ud } = await supabase.auth.getUser();
      setUserEmail(ud.user?.email ?? null);

      // orgs
      const { data: orgData } = await supabase
        .from("organizations")
        .select("id,name")
        .order("name", { ascending: true });

      const list = (orgData as Org[]) ?? [];
      setOrgs(list);
      setSelectedOrgId(list[0]?.id ?? "");
      setLoading(false);
    };

    load();
  }, []);

  const loadMissions = async (orgId: string) => {
    const { data } = await supabase
      .from("missions")
      .select("id,title,city,starts_at,lat,lng")
      .eq("organization_id", orgId)
      .order("starts_at", { ascending: true });

    setMissions((data as Mission[]) ?? []);
  };

  useEffect(() => {
    if (!selectedOrgId) return;
    loadMissions(selectedOrgId);
  }, [selectedOrgId]);

  const getMyLocation = () => {
    setMsg("");
    if (!navigator.geolocation) {
      setMsg("Geolocalisation non disponible sur ce navigateur.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setMsg("✅ Position récupérée. Tu peux créer la mission.");
      },
      () => setMsg("Impossible de récupérer la position.")
    );
  };

  const createMission = async () => {
    setMsg("");

    if (!selectedOrgId) {
      setMsg("Choisis une association.");
      return;
    }
    if (!title.trim()) {
      setMsg("Ajoute un titre de mission.");
      return;
    }

    const startsAtISO = startsAt ? new Date(startsAt).toISOString() : null;

    const { error } = await supabase.from("missions").insert({
      organization_id: selectedOrgId,
      title: title.trim(),
      description: description.trim(),
      city: city.trim(),
      starts_at: startsAtISO,
      lat,
      lng,
    });

    if (error) {
      setMsg("Erreur: " + error.message);
      return;
    }

    setMsg("✅ Mission créée !");
    setTitle("");
    setDescription("");
    setStartsAt("");
    // on garde city / coords
    await loadMissions(selectedOrgId);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    location.href = "/login";
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Chargement…</div>;
  }

  if (!userEmail) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold">Espace association</h1>
        <p className="mt-2 text-sm text-gray-600">
          Tu dois être connecté pour accéder à cette page.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-flex rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          Aller à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Espace association</h1>
          <p className="text-sm text-gray-600">
            Connecté : <span className="font-medium">{userEmail}</span>
          </p>
        </div>

        <button
          onClick={logout}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
        >
          Se déconnecter
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Form */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Créer une mission</h2>
          <p className="mt-1 text-sm text-gray-600">
            Choisis ton asso, puis remplis les infos.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-medium">Association</label>
              <select
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
              >
                {orgs.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
              {selectedOrgName && (
                <div className="mt-1 text-xs text-gray-500">
                  Sélection : {selectedOrgName}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Titre</label>
              <input
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Maraude, distribution, collecte…"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Ville</label>
                <input
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Perpignan"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Date / heure</label>
                <input
                  type="datetime-local"
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Décris la mission, le besoin, les horaires, etc."
              />
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="text-sm font-medium">Position (carte)</div>
              <div className="mt-1 text-xs text-gray-600">
                Optionnel : récupère ta position pour placer la mission.
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={getMyLocation}
                  className="rounded-lg bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-800"
                >
                  Utiliser ma position
                </button>

                <div className="text-xs text-gray-600">
                  {lat && lng ? (
                    <>
                      ✅ lat: <b>{lat.toFixed(5)}</b> — lng: <b>{lng.toFixed(5)}</b>
                    </>
                  ) : (
                    "Aucune coordonnée"
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={createMission}
              className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Créer la mission
            </button>

            {msg && (
              <div className="rounded-lg bg-white p-3 text-sm text-gray-700 border border-gray-200">
                {msg}
              </div>
            )}

            <div className="text-xs text-gray-500">
              Astuce : va sur <Link className="underline" href="/missions">/missions</Link> ou{" "}
              <Link className="underline" href="/map">/map</Link> pour voir le résultat.
            </div>
          </div>
        </div>

        {/* List */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Missions de l’association</h2>
          <p className="mt-1 text-sm text-gray-600">
            Liste des missions liées à l’asso sélectionnée.
          </p>

          <div className="mt-5 space-y-3">
            {missions.length === 0 ? (
              <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                Aucune mission pour le moment.
              </div>
            ) : (
              missions.map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-medium">{m.title}</div>
                    <span className="rounded-md bg-gray-100 px-2 py-1 text-xs">
                      {m.city}
                    </span>
                  </div>

                  {m.starts_at && (
                    <div className="mt-1 text-xs text-gray-500">
                      📅 {new Date(m.starts_at).toLocaleString()}
                    </div>
                  )}

                  <div className="mt-2 text-xs text-gray-500">
                    {m.lat && m.lng ? (
                      <>📍 {m.lat.toFixed(4)}, {m.lng.toFixed(4)}</>
                    ) : (
                      "📍 Pas de coordonnées"
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 flex gap-2">
            <Link
              href="/missions"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
            >
              Voir toutes les missions
            </Link>
            <Link
              href="/map"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
            >
              Voir sur la carte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}