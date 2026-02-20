"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginClient() {
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
      if (session?.user) router.replace(next);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [router, next]);

  const sendMagicLink = async () => {
    setLoading(true);
    setMsg("Envoi du lien...");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          next
        )}`,
      },
    });

    if (error) setMsg("Erreur: " + error.message);
    else setMsg("✅ Regarde ta boîte mail (et les spams) pour le lien de connexion.");

    setLoading(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setMsg("Déconnecté ✅");
    setUserEmail(null);
  };

  return (
    <main style={{ padding: 24, maxWidth: 520 }}>
      <h1>Connexion</h1>

      {userEmail ? (
        <>
          <p>
            ✅ Connecté en tant que <b>{userEmail}</b>
          </p>
          <button onClick={logout} style={{ marginTop: 12, padding: 12 }}>
            Se déconnecter
          </button>
        </>
      ) : (
        <>
          <p>Entre ton email, tu recevras un lien.</p>

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemple.com"
            style={{ width: "100%", padding: 12, marginTop: 12 }}
          />

          <button
            onClick={sendMagicLink}
            disabled={loading || !email}
            style={{ marginTop: 12, padding: 12 }}
          >
            {loading ? "Envoi..." : "Envoyer le lien de connexion"}
          </button>
        </>
      )}

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </main>
  );
}