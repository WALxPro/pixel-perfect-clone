import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FolderOpen, PenSquare, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/cms/AdminLayout";
import { ConfirmDialog, EmptyState, PageHeader, Panel } from "@/components/cms/ui-bits";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fmtDate, setCms, slugify, uid, useCms, type Category } from "@/lib/cms-store";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — Inkwell CMS" },
      { name: "description", content: "Organize blog posts into categories." },
      { property: "og:title", content: "Categories — Inkwell CMS" },
      { property: "og:description", content: "Organize blog posts into categories." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const s = useCms();
  const [edit, setEdit] = useState<Category | null>(null);
  const [del, setDel] = useState<Category | null>(null);
  const blank = (): Category => ({ id: "", name: "", slug: "", description: "", created: new Date().toISOString() });

  const save = () => {
    if (!edit?.name.trim()) return toast.error("Name is required");
    const c = { ...edit, slug: edit.slug || slugify(edit.name) };
    if (c.id) {
      const old = s.categories.find((x) => x.id === c.id)!;
      setCms((st) => ({ categories: st.categories.map((x) => (x.id === c.id ? c : x)), posts: st.posts.map((p) => (p.category === old.name ? { ...p, category: c.name } : p)) }));
      toast.success("Category updated");
    } else {
      setCms((st) => ({ categories: [...st.categories, { ...c, id: uid() }] }));
      toast.success("Category created");
    }
    setEdit(null);
  };

  return (
    <AdminLayout>
      <PageHeader title="Categories" description="Group your posts by topic." actions={<Button className="rounded-xl" onClick={() => setEdit(blank())}><Plus className="h-4 w-4" /> Add Category</Button>} />
      <Panel className="overflow-hidden">
        {s.categories.length === 0 ? (
          <EmptyState icon={FolderOpen} title="No categories yet" text="Create your first category to organize posts." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead><tr className="border-b text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">Name</th><th className="px-3 py-3">Description</th><th className="px-3 py-3">Slug</th><th className="px-3 py-3 text-right">Posts</th><th className="px-3 py-3">Created</th><th className="w-24 px-3 py-3" />
              </tr></thead>
              <tbody className="divide-y">
                {s.categories.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/40">
                    <td className="px-5 py-3.5 font-semibold">{c.name}</td>
                    <td className="max-w-xs truncate px-3 py-3.5 text-muted-foreground">{c.description || "—"}</td>
                    <td className="px-3 py-3.5"><code className="rounded bg-muted px-1.5 py-0.5 text-xs">{c.slug}</code></td>
                    <td className="px-3 py-3.5 text-right tabular-nums">{s.posts.filter((p) => p.category === c.name && p.status !== "trash").length}</td>
                    <td className="px-3 py-3.5 text-muted-foreground">{fmtDate(c.created)}</td>
                    <td className="px-3 py-3.5 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEdit(c)} aria-label="Edit"><PenSquare className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDel(c)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
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
          <DialogHeader><DialogTitle>{edit?.id ? "Edit category" : "Add category"}</DialogTitle></DialogHeader>
          {edit && (
            <div className="space-y-4">
              <div><Label>Name</Label><Input className="mt-1.5" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value, slug: slugify(e.target.value) })} /></div>
              <div><Label>Slug</Label><Input className="mt-1.5" value={edit.slug} onChange={(e) => setEdit({ ...edit, slug: slugify(e.target.value) })} /></div>
              <div><Label>Description</Label><Textarea className="mt-1.5" value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={!!del} onOpenChange={(o) => !o && setDel(null)} title={`Delete "${del?.name}"?`} description="Posts in this category will keep their content but lose this category." onConfirm={() => { setCms((st) => ({ categories: st.categories.filter((x) => x.id !== del?.id) })); setDel(null); toast.success("Category deleted"); }} />
    </AdminLayout>
  );
}
