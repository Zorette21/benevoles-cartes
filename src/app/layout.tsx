import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Bénévoles-Carte",
  description: "Trouve des missions bénévoles près de chez toi.",
  manifest: "/manifest.webmanifest",
  themeColor: "#111827",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-semibold">
              Bénévoles-Carte
            </Link>

            <nav className="flex items-center gap-4 text-sm">
              <Link className="hover:underline" href="/missions">
                Missions
              </Link>
              <Link className="hover:underline" href="/map">
                Carte
              </Link>
              <Link className="hover:underline" href="/org">
                Espace asso
              </Link>
              <Link
                className="rounded-md bg-gray-900 px-3 py-2 text-white hover:bg-gray-800"
                href="/login"
              >
                Connexion
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>

        <footer className="mt-10 border-t bg-white">
          <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-gray-500">
            © {new Date().getFullYear()} Bénévoles-Carte — Prototype (Pyrénées-Orientales)
          </div>
        </footer>
      </body>
    </html>
  );
}