import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight">
          Trouve une mission bénévole près de chez toi
        </h1>
        <p className="mt-3 max-w-2xl text-gray-600">
          Bénévoles-Carte recense les missions proposées par les associations
          (Pyrénées-Orientales pour commencer). Tu peux voir les missions, te
          positionner sur une carte, et t’inscrire.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/map"
            className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
          >
            Voir la carte
          </Link>
          <Link
            href="/missions"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 hover:bg-gray-50"
          >
            Voir les missions
          </Link>
          <Link
            href="/org"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 hover:bg-gray-50"
          >
            Espace association
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold">Pour les bénévoles</div>
          <p className="mt-2 text-sm text-gray-600">
            Découvre des missions, filtre par ville, et repère les lieux sur la carte.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold">Pour les assos</div>
          <p className="mt-2 text-sm text-gray-600">
            Publie tes missions et localise-les. Plus simple pour recruter.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold">Prototype rapide</div>
          <p className="mt-2 text-sm text-gray-600">
            On avance vite : d’abord utile, ensuite beau, puis “app installable”.
          </p>
        </div>
      </section>
    </div>
  );
}