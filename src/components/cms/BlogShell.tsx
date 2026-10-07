import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Search } from "lucide-react";
import { useCms } from "@/lib/cms-store";

export function BlogShell({ children, onSearch }: { children: ReactNode; onSearch?: (q: string) => void }) {
  const s = useCms();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  return (
    <div className="min-h-screen bg-card">
      <div className="bg-foreground px-4 py-2 text-center text-xs text-background">
        You're previewing your website ·{" "}
        <Link to="/" className="inline-flex items-center gap-1 font-semibold underline"><ArrowLeft className="h-3 w-3" /> Back to dashboard</Link>
      </div>
      <header className="sticky top-0 z-20 border-b bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link to="/blog" className="font-serif text-2xl font-bold tracking-tight">{s.settings.siteName}<span className="text-primary">.</span></Link>
          <nav className="hidden gap-5 text-sm text-muted-foreground md:flex">
            {s.categories.slice(0, 4).map((c) => (
              <Link key={c.id} to="/blog" search={{ category: c.name }} className="transition hover:text-foreground">{c.name}</Link>
            ))}
          </nav>
          <form className="relative ml-auto" onSubmit={(e) => { e.preventDefault(); onSearch ? onSearch(q) : navigate({ to: "/blog", search: { q } }); }}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => { setQ(e.target.value); onSearch?.(e.target.value); }} placeholder="Search" className="h-9 w-36 rounded-full border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary sm:w-52" />
          </form>
        </div>
      </header>
      {children}
      <footer className="mt-20 border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div><span className="font-serif text-lg font-bold text-foreground">{s.settings.siteName}.</span> {s.settings.siteDescription}</div>
          <div>© {new Date().getFullYear()} {s.settings.siteName}. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
