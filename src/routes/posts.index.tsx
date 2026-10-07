import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Copy, Eye, FileText, MoreHorizontal, PenSquare, Plus, RotateCcw, Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/cms/AdminLayout";
import { ConfirmDialog, EmptyState, FilterTabs, PageHeader, Panel, StatusBadge } from "@/components/cms/ui-bits";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { deletePosts, duplicatePost, fmtDate, fmtNum, setPostStatus, useCms, userById, type PostStatus } from "@/lib/cms-store";

export const Route = createFileRoute("/posts/")({
  validateSearch: (s: Record<string, unknown>): { q?: string } => (typeof s.q === "string" && s.q ? { q: s.q } : {}),
  head: () => ({
    meta: [
      { title: "Posts — Inkwell CMS" },
      { name: "description", content: "Search, filter and manage every post on your blog." },
      { property: "og:title", content: "Posts — Inkwell CMS" },
      { property: "og:description", content: "Search, filter and manage every post on your blog." },
    ],
  }),
  component: PostsPage,
});

const PER_PAGE = 8;
type Tab = "all" | PostStatus;

function PostsPage() {
  const s = useCms();
  const navigate = useNavigate();
  const { q: initialQ } = Route.useSearch();
  const [q, setQ] = useState(initialQ ?? "");
  const [tab, setTab] = useState<Tab>("all");
  const [cats, setCats] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [sel, setSel] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<string[] | null>(null);

  const count = (st: Tab) => s.posts.filter((p) => (st === "all" ? p.status !== "trash" : p.status === st)).length;
  const filtered = useMemo(
    () =>
      s.posts
        .filter((p) => (tab === "all" ? p.status !== "trash" : p.status === tab))
        .filter((p) => !cats.length || cats.includes(p.category))
        .filter((p) => !q || p.title.toLowerCase().includes(q.toLowerCase())),
    [s.posts, tab, cats, q],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const cur = Math.min(page, pages);
  const rows = filtered.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);
  const allSel = rows.length > 0 && rows.every((r) => sel.includes(r.id));

  const trash = (ids: string[]) => {
    setPostStatus(ids, "trash");
    setSel([]);
    toast.success(ids.length > 1 ? `${ids.length} posts moved to trash` : "Post moved to trash");
  };

  const Actions = ({ id, slug, status }: { id: string; slug: string; status: PostStatus }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Actions"><MoreHorizontal className="h-4 w-4" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 rounded-xl">
        <DropdownMenuItem onClick={() => navigate({ to: "/posts/$id", params: { id } })}><PenSquare className="h-4 w-4" /> Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={() => { duplicatePost(id); toast.success("Post duplicated"); }}><Copy className="h-4 w-4" /> Duplicate</DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate({ to: "/blog/$slug", params: { slug } })}><Eye className="h-4 w-4" /> Preview</DropdownMenuItem>
        <DropdownMenuSeparator />
        {status === "trash" ? (
          <>
            <DropdownMenuItem onClick={() => { setPostStatus([id], "draft"); toast.success("Post restored as draft"); }}><RotateCcw className="h-4 w-4" /> Restore</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => setConfirm([id])}><Trash2 className="h-4 w-4" /> Delete permanently</DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem className="text-destructive" onClick={() => trash([id])}><Trash2 className="h-4 w-4" /> Move to Trash</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <AdminLayout>
      <PageHeader
        title="Posts"
        description="Create, organize and publish your stories."
        actions={
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-xl"><SlidersHorizontal className="h-4 w-4" /> Filters{cats.length > 0 && <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground">{cats.length}</span>}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-xl">
                <DropdownMenuLabel>Category</DropdownMenuLabel>
                {s.categories.map((c) => (
                  <DropdownMenuCheckboxItem key={c.id} checked={cats.includes(c.name)} onCheckedChange={(v) => { setCats(v ? [...cats, c.name] : cats.filter((x) => x !== c.name)); setPage(1); }}>
                    {c.name}
                  </DropdownMenuCheckboxItem>
                ))}
                {cats.length > 0 && (<><DropdownMenuSeparator /><DropdownMenuItem onClick={() => setCats([])}>Clear filters</DropdownMenuItem></>)}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button asChild className="rounded-xl"><Link to="/posts/new"><Plus className="h-4 w-4" /> New Post</Link></Button>
          </>
        }
      />

      <Panel>
        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
          <FilterTabs<Tab>
            value={tab}
            onChange={(v) => { setTab(v); setPage(1); setSel([]); }}
            options={(["all", "published", "draft", "scheduled", "trash"] as Tab[]).map((t) => ({ value: t, label: t[0].toUpperCase() + t.slice(1), count: count(t) }))}
          />
          <div className="relative lg:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search posts..." className="h-10 w-full rounded-xl border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </div>
        </div>

        {sel.length > 0 && (
          <div className="flex items-center gap-3 border-b bg-accent/50 px-4 py-2.5 text-sm">
            <span className="font-medium">{sel.length} selected</span>
            {tab === "trash" ? (
              <Button size="sm" variant="destructive" className="rounded-lg" onClick={() => setConfirm(sel)}>Delete permanently</Button>
            ) : (
              <>
                <Button size="sm" variant="outline" className="rounded-lg" onClick={() => { setPostStatus(sel, "published"); setSel([]); toast.success("Posts published successfully"); }}>Publish</Button>
                <Button size="sm" variant="outline" className="rounded-lg text-destructive" onClick={() => trash(sel)}>Move to Trash</Button>
              </>
            )}
            <button className="ml-auto text-muted-foreground hover:text-foreground" onClick={() => setSel([])}>Clear</button>
          </div>
        )}

        {rows.length === 0 ? (
          <EmptyState icon={FileText} title="No posts found" text={q ? "Try a different search term or clear your filters." : "There's nothing here yet. Start writing your next story."} action={<Button asChild className="rounded-xl"><Link to="/posts/new"><Plus className="h-4 w-4" /> New Post</Link></Button>} />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <th className="w-10 px-4 py-3"><Checkbox checked={allSel} onCheckedChange={(v) => setSel(v ? rows.map((r) => r.id) : [])} /></th>
                    <th className="px-2 py-3">Title</th>
                    <th className="px-3 py-3">Author</th>
                    <th className="px-3 py-3">Category</th>
                    <th className="hidden px-3 py-3 xl:table-cell">Tags</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3 text-right">Views</th>
                    <th className="px-3 py-3">Date</th>
                    <th className="w-12 px-3 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((p) => (
                    <tr key={p.id} className="transition hover:bg-muted/40">
                      <td className="px-4 py-3"><Checkbox checked={sel.includes(p.id)} onCheckedChange={(v) => setSel(v ? [...sel, p.id] : sel.filter((x) => x !== p.id))} /></td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-3">
                          {p.image ? <img src={p.image} alt="" className="h-10 w-14 shrink-0 rounded-lg object-cover" /> : <div className="h-10 w-14 shrink-0 rounded-lg bg-muted" />}
                          <Link to="/posts/$id" params={{ id: p.id }} className="line-clamp-2 max-w-xs font-semibold hover:text-primary">{p.title || "(Untitled)"}</Link>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{userById(s, p.authorId)?.name}</td>
                      <td className="px-3 py-3"><span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">{p.category}</span></td>
                      <td className="hidden px-3 py-3 text-xs text-muted-foreground xl:table-cell">{p.tags.slice(0, 2).map((t) => `#${t}`).join(" ")}</td>
                      <td className="px-3 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-3 py-3 text-right tabular-nums">{fmtNum(p.views)}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{fmtDate(p.date)}</td>
                      <td className="px-3 py-3"><Actions id={p.id} slug={p.slug} status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="divide-y md:hidden">
              {rows.map((p) => (
                <div key={p.id} className="flex gap-3 p-4">
                  <Checkbox className="mt-1" checked={sel.includes(p.id)} onCheckedChange={(v) => setSel(v ? [...sel, p.id] : sel.filter((x) => x !== p.id))} />
                  {p.image && <img src={p.image} alt="" className="h-16 w-20 shrink-0 rounded-lg object-cover" />}
                  <div className="min-w-0 flex-1">
                    <Link to="/posts/$id" params={{ id: p.id }} className="line-clamp-2 text-sm font-semibold">{p.title || "(Untitled)"}</Link>
                    <div className="mt-1 text-xs text-muted-foreground">{userById(s, p.authorId)?.name} · {p.category} · {fmtDate(p.date)}</div>
                    <div className="mt-2 flex items-center gap-2"><StatusBadge status={p.status} /><span className="text-xs text-muted-foreground">{fmtNum(p.views)} views</span></div>
                  </div>
                  <Actions id={p.id} slug={p.slug} status={p.status} />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
              <span>Showing {(cur - 1) * PER_PAGE + 1}–{Math.min(cur * PER_PAGE, filtered.length)} of {filtered.length}</span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="rounded-lg" disabled={cur === 1} onClick={() => setPage(cur - 1)}>Previous</Button>
                {Array.from({ length: pages }, (_, i) => (
                  <Button key={i} variant={cur === i + 1 ? "default" : "ghost"} size="sm" className="hidden w-9 rounded-lg sm:inline-flex" onClick={() => setPage(i + 1)}>{i + 1}</Button>
                ))}
                <Button variant="outline" size="sm" className="rounded-lg" disabled={cur === pages} onClick={() => setPage(cur + 1)}>Next</Button>
              </div>
            </div>
          </>
        )}
      </Panel>

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="Delete permanently?"
        description="These posts will be removed forever. This action cannot be undone."
        onConfirm={() => { if (confirm) deletePosts(confirm); setSel([]); setConfirm(null); toast.success("Deleted permanently"); }}
      />
    </AdminLayout>
  );
}
