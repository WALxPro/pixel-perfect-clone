import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDownRight, ArrowUpRight, Check, Eye, FileCheck, FileText, MessageSquare, PenSquare, Plus, Trash2, FilePen } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/cms/AdminLayout";
import { ConfirmDialog, FilterTabs, Panel, StatusBadge } from "@/components/cms/ui-bits";
import { Button } from "@/components/ui/button";
import { deletePosts, fmtDate, fmtNum, setCms, useCms, userById } from "@/lib/cms-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Inkwell CMS" },
      { name: "description", content: "Overview of posts, comments, views and analytics for your blog." },
      { property: "og:title", content: "Dashboard — Inkwell CMS" },
      { property: "og:description", content: "Overview of posts, comments, views and analytics for your blog." },
    ],
  }),
  component: Dashboard,
});

type Range = "7d" | "30d" | "3m" | "1y";
function series(range: Range) {
  const n = { "7d": 7, "30d": 30, "3m": 12, "1y": 12 }[range];
  return Array.from({ length: n }, (_, i) => {
    const t = i / n;
    const views = Math.round(1800 + Math.sin(i * 0.9) * 400 + t * 1400 + ((i * 37) % 300));
    const label =
      range === "1y"
        ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i]
        : range === "3m"
          ? `W${i + 1}`
          : new Date(Date.now() - (n - 1 - i) * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return { label, Views: views, Visitors: Math.round(views * 0.62), Engagement: Math.round(views * 0.28) };
  });
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function Dashboard() {
  const s = useCms();
  const navigate = useNavigate();
  const [range, setRange] = useState<Range>("30d");
  const [toDelete, setToDelete] = useState<string | null>(null);
  const data = useMemo(() => series(range), [range]);
  const live = s.posts.filter((p) => p.status !== "trash");
  const stats = [
    { label: "Total Posts", value: live.length, change: 12.5, icon: FileText },
    { label: "Published", value: live.filter((p) => p.status === "published").length, change: 8.2, icon: FileCheck },
    { label: "Drafts", value: live.filter((p) => p.status === "draft").length, change: -3.1, icon: FilePen },
    { label: "Comments", value: s.comments.filter((c) => c.status !== "trash" && c.status !== "spam").length, change: 18.4, icon: MessageSquare },
    { label: "Total Views", value: fmtNum(live.reduce((a, p) => a + p.views, 0)), change: 24.7, icon: Eye },
  ];
  const recentPosts = [...live].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 5);
  const recentComments = s.comments.filter((c) => c.status !== "trash").slice(0, 5);

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{greeting()}, Admin 👋</h1>
          <p className="mt-1 text-muted-foreground">Here's what's happening with your blog today.</p>
        </div>
        <Button asChild className="rounded-xl shadow-lift">
          <Link to="/posts/new">
            <Plus className="h-4 w-4" /> New Post
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {stats.map((st) => (
          <Panel key={st.label} className="p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{st.label}</span>
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-primary">
                <st.icon className="h-[18px] w-[18px]" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold tracking-tight">{st.value}</div>
            <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${st.change > 0 ? "text-success" : "text-destructive"}`}>
              {st.change > 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {Math.abs(st.change)}% <span className="font-normal text-muted-foreground">vs last month</span>
            </div>
          </Panel>
        ))}
      </div>

      <Panel className="mt-6 p-5 sm:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Analytics</h2>
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
              {["Views", "Visitors", "Engagement"].map((k, i) => (
                <span key={k} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: `var(--chart-${i + 1})` }} /> {k}
                </span>
              ))}
            </div>
          </div>
          <FilterTabs<Range>
            value={range}
            onChange={setRange}
            options={[
              { value: "7d", label: "7 Days" },
              { value: "30d", label: "30 Days" },
              { value: "3m", label: "3 Months" },
              { value: "1y", label: "1 Year" },
            ]}
          />
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: -20, right: 4 }}>
              <defs>
                {[1, 2, 3].map((i) => (
                  <linearGradient key={i} id={`g${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={`var(--chart-${i})`} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={`var(--chart-${i})`} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" minTickGap={20} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", boxShadow: "var(--shadow-soft)", fontSize: 12 }} />
              <Area type="monotone" dataKey="Views" stroke="var(--chart-1)" strokeWidth={2} fill="url(#g1)" />
              <Area type="monotone" dataKey="Visitors" stroke="var(--chart-2)" strokeWidth={2} fill="url(#g2)" />
              <Area type="monotone" dataKey="Engagement" stroke="var(--chart-3)" strokeWidth={2} fill="url(#g3)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <Panel className="xl:col-span-3">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="font-semibold">Recent Posts</h2>
            <Link to="/posts" className="text-sm font-medium text-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y">
            {recentPosts.map((p) => (
              <div key={p.id} className="group flex items-center gap-4 px-5 py-3 transition hover:bg-muted/50">
                <img src={p.image} alt="" className="h-12 w-16 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <Link to="/posts/$id" params={{ id: p.id }} className="line-clamp-1 text-sm font-semibold hover:text-primary">{p.title}</Link>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                    <span>{userById(s, p.authorId)?.name}</span>·<span>{p.category}</span>·<span>{fmtDate(p.date)}</span>·<span>{fmtNum(p.views)} views</span>
                  </div>
                </div>
                <div className="hidden sm:block"><StatusBadge status={p.status} /></div>
                <div className="flex gap-0.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate({ to: "/posts/$id", params: { id: p.id } })} aria-label="Edit"><PenSquare className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate({ to: "/blog/$slug", params: { slug: p.slug } })} aria-label="Preview"><Eye className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setToDelete(p.id)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="xl:col-span-2">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="font-semibold">Recent Comments</h2>
            <Link to="/comments" className="text-sm font-medium text-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y">
            {recentComments.map((c) => (
              <div key={c.id} className="flex gap-3 px-5 py-3">
                <img src={c.avatar} alt="" className="h-9 w-9 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold">{c.name}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{c.text}</p>
                  <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="truncate">on {s.posts.find((p) => p.id === c.postId)?.title} · {fmtDate(c.date)}</span>
                    <div className="flex shrink-0 gap-1">
                      {c.status !== "approved" && (
                        <button className="rounded-md p-1 text-success hover:bg-success-soft" aria-label="Approve" onClick={() => { setCms((st) => ({ comments: st.comments.map((x) => (x.id === c.id ? { ...x, status: "approved" } : x)) })); toast.success("Comment approved"); }}>
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button className="rounded-md p-1 text-destructive hover:bg-destructive/10" aria-label="Delete" onClick={() => { setCms((st) => ({ comments: st.comments.map((x) => (x.id === c.id ? { ...x, status: "trash" } : x)) })); toast.success("Comment moved to trash"); }}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Delete this post?"
        description="This post will be permanently removed. This can't be undone."
        onConfirm={() => { if (toDelete) deletePosts([toDelete]); setToDelete(null); toast.success("Post deleted"); }}
      />
    </AdminLayout>
  );
}
