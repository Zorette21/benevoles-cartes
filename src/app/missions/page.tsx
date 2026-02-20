"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Mission = {
  id: string;
  title: string;
  description: string | null;
  city: string | null;
  starts_at: string | null;
  org_id: string;
};

type Org = {
  id: string;
  name: string;
};

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [orgsById, setOrgsById] = useState<Record<string, Org>>({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [myMissionIds, setMyMissionIds] = useState<Set<string>>(new Set());

  const [actionMsg, setActionMsg] = useState("");

  const missionsCount = useMemo(() => missions.length, [missions.length]);

  const loadAll = async () => {
    setLoading(true);
    setErrorMsg("");
    setActionMsg("");

    // user
    const { data: uData } = await supabase.auth.getUser();
    const uid = uData.user?.id ?? null;
    setUserId(uid);
    setUserEmail(uData.user?.email ?? null);

    // orgs
    const { data: orgs, error: orgErr } = await supabase
      .from("organizations")
      .select("id, name");

    if (orgErr) {
      setErrorMsg("Erreur orgs: " + orgErr.message);
      setLoading(false);
      return;
    }

    const map: Record<string, Org> = {};
    (orgs ?? []).forEach((o) => (map[o.id] = o));
    setOrgsById(map);

    // missions
    const { data: missionsData, error: missionsErr } = await supabase
      .from("missions")
      .select("id, title, description, city, starts_at, org_id")
      .order("created_at", { ascending: false })
      .limit(100);

    if (missionsErr) {
      setErrorMsg("Erreur missions: " + missionsErr.message);
      setLoading(false);
      return;
    }
    setMissions((missionsData ?? []) as Mission[]);

    // signups (si connecté)
    if (uid) {
      const { data: signups, error: sErr } = await supabase
        .from("signups")
        .select("mission_id")
        .eq("user_id", uid);

      if (!sErr) {
        setMyMissionIds(new Set((signups ?? []).map((s) => s.mission_id)));
      }
    } else {
      setMyMissionIds(new Set());
    }

    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signup = async (missionId: string) => {
    setActionMsg("");

    const { data: uData } = await supabase.auth.getUser();
    const uid = uData.user?.id ?? null;

    if (!uid) {
      setActionMsg("🔒 Connecte-toi d’abord sur /login.");
      return;
    }

    const { error: sErr } = await supabase.from("signups").insert({
      mission_id: missionId,
      user_id: uid,
    });

    if (sErr) {
      if (sErr.message.toLowerCase().includes("duplicate")) {
        setActionMsg("Tu es déjà inscrit(e) ✅");
      } else {
        setActionMsg("Erreur inscription: " + sErr.message);
      }
      return;
    }

    setActionMsg("✅ Inscription enregistrée !");
    setMyMissionIds((prev) => new Set([...Array.from(prev), missionId]));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Missions bénévoles</h1>
          <p className="text-sm text-gray-600">
            {loading ? "Chargement..." : `${missionsCount} mission(s) disponibles`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/map"
            className="rounded-xl border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Voir sur la carte
          </Link>
          <Link
            href="/org"
            className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
          >
            Créer une mission (asso)
          </Link>
        </div>
      </div>

      {/* User banner */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        {userId ? (
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              Connecté : <span className="font-medium">{userEmail}</span>
            </div>
            <div className="text-xs text-gray-500">
              Clique “Je m’inscris” pour rejoindre une mission.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-700">
              Connecte-toi pour t’inscrire aux missions.
            </p>
            <Link
              href="/login"
              className="inline-flex w-fit rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
            >
              Aller au login
            </Link>
          </div>
        )}

        {actionMsg && <p className="mt-2 text-sm text-gray-700">{actionMsg}</p>}
      </div>

      {/* Errors */}
      {errorMsg && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {errorMsg}
        </div>
      )}

      {/* List */}
      <div className="grid gap-4 md:grid-cols-2">
        {missions.map((m) => {
          const isSignedUp = myMissionIds.has(m.id);
          const orgName = orgsById[m.org_id]?.name ?? "—";

          return (
            <div key={m.id} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{m.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {orgName} {m.city ? `• ${m.city}` : ""}
                  </p>
                </div>

                {m.starts_at ? (
                  <div className="rounded-xl border bg-gray-50 px-3 py-2 text-xs text-gray-700">
                    {new Date(m.starts_at).toLocaleString()}
                  </div>
                ) : (
                  <div className="rounded-xl border bg-gray-50 px-3 py-2 text-xs text-gray-500">
                    Date à préciser
                  </div>
                )}
              </div>

              {m.description && (
                <p className="mt-3 line-clamp-3 text-sm text-gray-700">
                  {m.description}
                </p>
              )}

              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => signup(m.id)}
                  disabled={isSignedUp}
                  className={[
                    "rounded-xl px-4 py-2 text-sm font-medium transition",
                    isSignedUp
                      ? "cursor-not-allowed bg-gray-100 text-gray-500"
                      : "bg-gray-900 text-white hover:bg-black",
                  ].join(" ")}
                >
                  {isSignedUp ? "Déjà inscrit ✅" : "Je m’inscris"}
                </button>

                <Link
                  href="/map"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Voir sur la carte →
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {!loading && !errorMsg && missions.length === 0 && (
        <div className="rounded-2xl border bg-white p-6 text-sm text-gray-700">
          Aucune mission pour l’instant. Va sur <code>/org</code> pour en créer une.
        </div>
      )}
    </div>
  );
}
