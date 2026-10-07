import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Hash, PenSquare, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/cms/AdminLayout";
import { ConfirmDialog, EmptyState, PageHeader, Panel } from "@/components/cms/ui-bits";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setCms, slugify, uid, useCms, type Tag } from "@/lib/cms-store";

export const Route = createFileRoute("/tags")({
  head: () => ({
    meta: [
      { title: "Tags — Inkwell CMS" },
      { name: "description", content: "Create, rename and remove post tags." },
      { property: "og:title", content: "Tags — Inkwell CMS" },
      { property: "og:description", content: "Create, rename and remove post tags." },
    ],
  }),
  component: TagsPage,
});

function TagsPage() {
  const s = useCms();
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<Tag | null>(null);
  const [del, setDel] = useState<Tag | null>(null);
  const rows = s.tags.filter((t) => t.name.toLowerCase().includes(q.toLowerCase()));
  const count = (n: string) => s.posts.filter((p) => p.tags.includes(n) && p.status !== "trash").length;

  const save = () => {
    if (!edit?.name.trim()) return toast.error("Name is required");
    const t = { ...edit, slug: edit.slug || slugify(edit.name) };
    if (t.id) {
      const old = s.tags.find((x) => x.id === t.id)!;
      setCms((st) => ({ tags: st.tags.map((x) => (x.id === t.id ? t : x)), posts: st.posts.map((p) => ({ ...p, tags: p.tags.map((x) => (x === old.name ? t.name : x)) })) }));
      toast.success("Tag updated");
    } else {
      setCms((st) => ({ tags: [...st.tags, { ...t, id: uid() }] }));
      toast.success("Tag created");
    }
    setEdit(null);
  };

  return (
    <AdminLayout>
      <PageHeader title="Tags" description="Fine-grained labels that help readers find related posts." actions={<Button className="rounded-xl" onClick={() => setEdit({ id: "", name: "", slug: "" })}><Plus className="h-4 w-4" /> Add Tag</Button>} />
      <Panel className="overflow-hidden">
        <div className="border-b p-4">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tags..." className="h-10 w-full rounded-xl border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </div>
        </div>
        {rows.length === 0 ? (
          <EmptyState icon={Hash} title="No tags found" text="Try another search or add a new tag." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead><tr className="border-b text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"><th className="px-5 py-3">Tag</th><th className="px-3 py-3">Slug</th><th className="px-3 py-3 text-right">Posts</th><th className="w-24" /></tr></thead>
              <tbody className="divide-y">
                {rows.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/40">
                    <td className="px-5 py-3"><span className="inline-flex items-center gap-1 rounded-lg bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground"><Hash className="h-3 w-3" />{t.name}</span></td>
                    <td className="px-3 py-3"><code className="rounded bg-muted px-1.5 py-0.5 text-xs">{t.slug}</code></td>
                    <td className="px-3 py-3 text-right tabular-nums">{count(t.name)}</td>
                    <td className="px-3 py-3 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEdit(t)} aria-label="Edit"><PenSquare className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDel(t)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>{edit?.id ? "Edit tag" : "Add tag"}</DialogTitle></DialogHeader>
          {edit && (
            <div className="space-y-4">
              <div><Label>Name</Label><Input className="mt-1.5" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value, slug: slugify(e.target.value) })} /></div>
              <div><Label>Slug</Label><Input className="mt-1.5" value={edit.slug} onChange={(e) => setEdit({ ...edit, slug: slugify(e.target.value) })} /></div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={!!del} onOpenChange={(o) => !o && setDel(null)} title={`Delete tag "${del?.name}"?`} description="It will be removed from all posts." onConfirm={() => { setCms((st) => ({ tags: st.tags.filter((x) => x.id !== del?.id), posts: st.posts.map((p) => ({ ...p, tags: p.tags.filter((x) => x !== del?.name) })) })); setDel(null); toast.success("Tag deleted"); }} />
    </AdminLayout>
  );
}
