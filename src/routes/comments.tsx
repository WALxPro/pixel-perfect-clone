import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, MessageSquare, Reply, ShieldAlert, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/cms/AdminLayout";
import { ConfirmDialog, EmptyState, FilterTabs, PageHeader, Panel, StatusBadge } from "@/components/cms/ui-bits";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { fmtDate, setCms, uid, useCms, type CommentStatus } from "@/lib/cms-store";

export const Route = createFileRoute("/comments")({
  head: () => ({
    meta: [
      { title: "Comments — Inkwell CMS" },
      { name: "description", content: "Moderate, approve and reply to reader comments." },
      { property: "og:title", content: "Comments — Inkwell CMS" },
      { property: "og:description", content: "Moderate, approve and reply to reader comments." },
    ],
  }),
  component: CommentsPage,
});

type Tab = "all" | CommentStatus;
const msgs: Record<CommentStatus, string> = { approved: "Comment approved", spam: "Marked as spam", trash: "Moved to trash", pending: "Marked as pending" };

function CommentsPage() {
  const s = useCms();
  const [tab, setTab] = useState<Tab>("all");
  const [sel, setSel] = useState<string[]>([]);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [del, setDel] = useState<string[] | null>(null);
  const rows = s.comments.filter((c) => (tab === "all" ? c.status !== "trash" && c.status !== "spam" : c.status === tab));
  const cnt = (t: Tab) => s.comments.filter((c) => (t === "all" ? c.status !== "trash" && c.status !== "spam" : c.status === t)).length;

  const setStatus = (ids: string[], status: CommentStatus) => {
    setCms((st) => ({ comments: st.comments.map((c) => (ids.includes(c.id) ? { ...c, status } : c)) }));
    setSel([]);
    toast.success(ids.length > 1 ? `${ids.length} comments updated` : msgs[status]);
  };
  const sendReply = (postId: string) => {
    if (!reply.trim()) return;
    const me = s.users[0];
    setCms((st) => ({ comments: [{ id: uid(), name: me.name, email: me.email, avatar: me.avatar, text: reply, postId, date: new Date().toISOString(), status: "approved" }, ...st.comments] }));
    setReply("");
    setReplyTo(null);
    toast.success("Reply posted");
  };

  return (
    <AdminLayout>
      <PageHeader title="Comments" description="Keep the conversation healthy." />
      <Panel className="overflow-hidden">
        <div className="border-b p-4">
          <FilterTabs<Tab> value={tab} onChange={(v) => { setTab(v); setSel([]); }} options={(["all", "pending", "approved", "spam", "trash"] as Tab[]).map((t) => ({ value: t, label: t[0].toUpperCase() + t.slice(1), count: cnt(t) }))} />
        </div>
        {rows.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 px-4 py-2.5 text-sm">
            <Checkbox checked={sel.length === rows.length} onCheckedChange={(v) => setSel(v ? rows.map((r) => r.id) : [])} />
            <span className="mr-2 text-muted-foreground">{sel.length ? `${sel.length} selected` : "Select all"}</span>
            {sel.length > 0 && (
              <>
                <Button size="sm" variant="outline" className="rounded-lg" onClick={() => setStatus(sel, "approved")}>Approve</Button>
                <Button size="sm" variant="outline" className="rounded-lg" onClick={() => setStatus(sel, "spam")}>Spam</Button>
                {tab === "trash" ? <Button size="sm" variant="destructive" className="rounded-lg" onClick={() => setDel(sel)}>Delete permanently</Button> : <Button size="sm" variant="outline" className="rounded-lg text-destructive" onClick={() => setStatus(sel, "trash")}>Trash</Button>}
              </>
            )}
          </div>
        )}
        {rows.length === 0 ? (
          <EmptyState icon={MessageSquare} title="All clear" text="There are no comments in this view." />
        ) : (
          <div className="divide-y">
            {rows.map((c) => {
              const post = s.posts.find((p) => p.id === c.postId);
              return (
                <div key={c.id} className="flex gap-3 p-4 transition hover:bg-muted/30 sm:gap-4 sm:px-5">
                  <Checkbox className="mt-2.5" checked={sel.includes(c.id)} onCheckedChange={(v) => setSel(v ? [...sel, c.id] : sel.filter((x) => x !== c.id))} />
                  <img src={c.avatar} alt="" className="h-10 w-10 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-semibold">{c.name}</span>
                      <span className="text-xs text-muted-foreground">{fmtDate(c.date)}</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="mt-1 text-sm leading-relaxed">{c.text}</p>
                    {post && <div className="mt-1 text-xs text-muted-foreground">on <Link to="/blog/$slug" params={{ slug: post.slug }} className="font-medium text-primary hover:underline">{post.title}</Link></div>}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {c.status !== "approved" && <Button size="sm" variant="ghost" className="h-8 text-success hover:bg-success-soft hover:text-success" onClick={() => setStatus([c.id], "approved")}><Check className="h-3.5 w-3.5" /> Approve</Button>}
                      <Button size="sm" variant="ghost" className="h-8" onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}><Reply className="h-3.5 w-3.5" /> Reply</Button>
                      {c.status !== "spam" && <Button size="sm" variant="ghost" className="h-8" onClick={() => setStatus([c.id], "spam")}><ShieldAlert className="h-3.5 w-3.5" /> Spam</Button>}
                      <Button size="sm" variant="ghost" className="h-8 text-destructive hover:text-destructive" onClick={() => (c.status === "trash" ? setDel([c.id]) : setStatus([c.id], "trash"))}><Trash2 className="h-3.5 w-3.5" /> Delete</Button>
                    </div>
                    {replyTo === c.id && (
                      <div className="mt-3 space-y-2">
                        <Textarea autoFocus value={reply} onChange={(e) => setReply(e.target.value)} placeholder={`Reply to ${c.name}...`} rows={2} />
                        <div className="flex gap-2"><Button size="sm" onClick={() => sendReply(c.postId)}>Post reply</Button><Button size="sm" variant="ghost" onClick={() => setReplyTo(null)}>Cancel</Button></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
      <ConfirmDialog open={!!del} onOpenChange={(o) => !o && setDel(null)} title="Delete permanently?" description="These comments will be removed forever." onConfirm={() => { setCms((st) => ({ comments: st.comments.filter((c) => !del?.includes(c.id)) })); setDel(null); setSel([]); toast.success("Comments deleted"); }} />
    </AdminLayout>
  );
}
