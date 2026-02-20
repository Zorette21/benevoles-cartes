"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useSearchParams, useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const params = useSearchParams();
  const router = useRouter();
  const next = params.get("next") || "/missions";

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      setUserEmail(data.user?.email ?? null);
    };
    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const sendMagicLink = async () => {
    setMsg("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
  }
});

    setLoading(false);

    if (error) setMsg("Erreur: " + error.message);
    else setMsg("✅ Regarde ta boîte mail (et les spams) pour le lien de connexion.");
  };

  const logout = async () => {
    setMsg("");
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    setMsg("Déconnecté ✅");
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Connexion</h1>
        <p className="mt-1 text-sm text-gray-600">
          Connexion par lien magique (email).
        </p>

        {userEmail ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border bg-gray-50 p-4 text-sm">
              ✅ Connecté en tant que <span className="font-medium">{userEmail}</span>
            </div>

            <button
              onClick={logout}
              disabled={loading}
              className="w-full rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "..." : "Se déconnecter"}
            </button>

            <div className="flex items-center justify-between text-sm">
              <Link className="font-medium text-gray-700 hover:text-gray-900" href="/missions">
                ← Missions
              </Link>
              <Link className="font-medium text-gray-700 hover:text-gray-900" href="/map">
                Carte →
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            <label className="text-sm font-medium text-gray-700">Ton email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemple.com"
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-200"
            />

            <button
              onClick={sendMagicLink}
              disabled={loading || !email}
              className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Envoi..." : "Envoyer le lien"}
            </button>

            <p className="text-xs text-gray-500">
              Tu recevras un email avec un lien. Clique dessus pour te connecter.
            </p>

            <div className="flex items-center justify-between text-sm">
              <Link className="font-medium text-gray-700 hover:text-gray-900" href="/missions">
                ← Missions
              </Link>
              <Link className="font-medium text-gray-700 hover:text-gray-900" href="/org">
                Espace asso →
              </Link>
            </div>
          </div>
        )}

        {msg && (
          <div className="mt-4 rounded-xl border bg-gray-50 p-3 text-sm text-gray-800">
            {msg}
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-gray-500">
        V1 — Pyrénées-Orientales
      </p>
    </div>
  );
}
