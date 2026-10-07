import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { BlogShell } from "@/components/cms/BlogShell";
import { Button } from "@/components/ui/button";
import { fmtDate, readingTime, useCms, userById } from "@/lib/cms-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/blog/")({
  validateSearch: (s: Record<string, unknown>): { q?: string; category?: string } => ({
    ...(typeof s.q === "string" && s.q ? { q: s.q } : {}),
    ...(typeof s.category === "string" ? { category: s.category } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Inkwell — Thoughtful writing on design, code and work" },
      { name: "description", content: "Essays and practical guides on design, development, marketing and productivity." },
      { property: "og:title", content: "Inkwell — Thoughtful writing" },
      { property: "og:description", content: "Essays and practical guides on design, development, marketing and productivity." },
    ],
  }),
  component: BlogHome,
});

function BlogHome() {
  const s = useCms();
  const search = Route.useSearch();
  const [q, setQ] = useState(search.q ?? "");
  const [email, setEmail] = useState("");
  const cat = search.category;
  const published = s.posts.filter((p) => p.status === "published" && p.visibility === "public").sort((a, b) => +new Date(b.date) - +new Date(a.date));
  const list = published.filter((p) => (!cat || p.category === cat) && (!q || p.title.toLowerCase().includes(q.toLowerCase())));
  const [featured, ...rest] = list;
  const popular = [...published].sort((a, b) => b.views - a.views).slice(0, 4);
  const filtering = !!(cat || q);

  return (
    <BlogShell onSearch={setQ}>
      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        {filtering && (
          <div className="flex items-center justify-between pt-10">
            <h1 className="font-serif text-3xl font-bold">{cat ? cat : `Results for "${q}"`}</h1>
            <Link to="/blog" className="text-sm text-primary hover:underline">Clear</Link>
          </div>
        )}
        {featured && !filtering && (
          <Link to="/blog/$slug" params={{ slug: featured.slug }} className="group mt-10 grid items-center gap-8 md:grid-cols-2">
            <div className="overflow-hidden rounded-3xl"><img src={featured.image} alt="" className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105" /></div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">Featured · {featured.category}</span>
              <h1 className="mt-3 font-serif text-4xl font-bold leading-tight tracking-tight group-hover:text-primary sm:text-5xl">{featured.title}</h1>
              <p className="mt-4 text-lg text-muted-foreground">{featured.excerpt}</p>
              <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
                <img src={userById(s, featured.authorId)?.avatar} alt="" className="h-9 w-9 rounded-full" />
                <span className="font-medium text-foreground">{userById(s, featured.authorId)?.name}</span>· {fmtDate(featured.date)} · {readingTime(featured.content)} min read
              </div>
            </div>
          </Link>
        )}

        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_300px]">
          <section>
            <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Latest posts</h2>
            {(filtering ? list : rest).length === 0 && <p className="text-muted-foreground">No posts found.</p>}
            <div className={cn("grid gap-8", s.settings.layout === "grid" ? "sm:grid-cols-2" : "")}>
              {(filtering ? list : rest).map((p) => (
                <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }} className={cn("group", s.settings.layout === "list" && "flex gap-5")}>
                  <div className={cn("overflow-hidden rounded-2xl", s.settings.layout === "list" && "w-48 shrink-0")}><img src={p.image} alt="" className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-105" /></div>
                  <div>
                    <div className="mt-4 text-xs font-semibold uppercase tracking-wider text-primary">{p.category}</div>
                    <h3 className="mt-1.5 font-serif text-xl font-bold leading-snug group-hover:text-primary">{p.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
                    <div className="mt-3 text-xs text-muted-foreground">{fmtDate(p.date)} · {readingTime(p.content)} min read</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
          <aside className="space-y-10">
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {s.categories.map((c) => (
                  <Link key={c.id} to="/blog" search={{ category: c.name }} className={cn("rounded-full border px-3 py-1.5 text-sm transition hover:border-primary hover:text-primary", cat === c.name && "border-primary bg-accent text-accent-foreground")}>{c.name}</Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Popular</h3>
              <ol className="space-y-4">
                {popular.map((p, i) => (
                  <li key={p.id}><Link to="/blog/$slug" params={{ slug: p.slug }} className="group flex gap-3"><span className="font-serif text-2xl font-bold text-muted-foreground/40">0{i + 1}</span><span className="text-sm font-semibold leading-snug group-hover:text-primary">{p.title}</span></Link></li>
                ))}
              </ol>
            </div>
          </aside>
        </div>

        <section className="mt-20 rounded-3xl bg-gradient-primary px-6 py-12 text-center text-primary-foreground sm:px-12">
          <h2 className="font-serif text-3xl font-bold">Get the best stories in your inbox</h2>
          <p className="mx-auto mt-2 max-w-md opacity-90">One thoughtful email a week. No spam, unsubscribe anytime.</p>
          <form className="mx-auto mt-6 flex max-w-md gap-2" onSubmit={(e) => { e.preventDefault(); if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error("Please enter a valid email"); setEmail(""); toast.success("You're subscribed!"); }}>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-11 flex-1 rounded-xl bg-card px-4 text-sm text-foreground outline-none" />
            <Button type="submit" variant="secondary" className="h-11 rounded-xl">Subscribe</Button>
          </form>
        </section>
      </main>
    </BlogShell>
  );
}
