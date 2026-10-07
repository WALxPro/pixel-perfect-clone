import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Copy, FileText, Film, ImageIcon, Search, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/cms/AdminLayout";
import { addFiles } from "@/components/cms/MediaPicker";
import { ConfirmDialog, EmptyState, FilterTabs, PageHeader, Panel } from "@/components/cms/ui-bits";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fmtDate, setCms, useCms, type Media } from "@/lib/cms-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/media")({
  head: () => ({
    meta: [
      { title: "Media Library — Inkwell CMS" },
      { name: "description", content: "Upload, browse and manage images and files for your blog." },
      { property: "og:title", content: "Media Library — Inkwell CMS" },
      { property: "og:description", content: "Upload, browse and manage images and files for your blog." },
    ],
  }),
  component: MediaPage,
});

type F = "all" | Media["type"];

function MediaPage() {
  const s = useCms();
  const [q, setQ] = useState("");
  const [f, setF] = useState<F>("all");
  const [drag, setDrag] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [del, setDel] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const items = s.media.filter((m) => (f === "all" || m.type === f) && m.filename.toLowerCase().includes(q.toLowerCase()));
  const cur = s.media.find((m) => m.id === openId);
  const upd = (patch: Partial<Media>) => setCms((st) => ({ media: st.media.map((m) => (m.id === openId ? { ...m, ...patch } : m)) }));

  return (
    <AdminLayout>
      <PageHeader title="Media Library" description={`${s.media.length} files`} actions={<Button className="rounded-xl" onClick={() => ref.current?.click()}><Upload className="h-4 w-4" /> Upload Media</Button>} />
      <input ref={ref} type="file" multiple hidden accept="image/*,video/*,application/pdf" onChange={(e) => e.target.files && addFiles(e.target.files)} />

      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files); }}
        onClick={() => ref.current?.click()}
        className={cn("mb-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition", drag ? "border-primary bg-accent" : "hover:border-primary/50 hover:bg-muted/40")}
      >
        <div className="mb-2 grid h-11 w-11 place-items-center rounded-xl bg-accent text-primary"><Upload className="h-5 w-5" /></div>
        <div className="text-sm font-medium">Drop files here or <span className="text-primary">browse</span></div>
        <div className="text-xs text-muted-foreground">PNG, JPG, GIF, MP4 or PDF</div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs<F> value={f} onChange={setF} options={[{ value: "all", label: "All" }, { value: "image", label: "Images" }, { value: "video", label: "Videos" }, { value: "document", label: "Documents" }]} />
        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search media..." className="h-10 w-full rounded-xl border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
        </div>
      </div>

      {items.length === 0 ? (
        <Panel><EmptyState icon={ImageIcon} title="No media found" text="Upload files or change your filters." /></Panel>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((m) => (
            <button key={m.id} onClick={() => setOpenId(m.id)} className="group overflow-hidden rounded-2xl border bg-card text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                {m.type === "image" ? <img src={m.url} alt={m.alt} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="grid h-full place-items-center text-muted-foreground">{m.type === "video" ? <Film className="h-8 w-8" /> : <FileText className="h-8 w-8" />}</div>}
              </div>
              <div className="p-3">
                <div className="truncate text-sm font-medium">{m.filename}</div>
                <div className="mt-0.5 flex justify-between text-xs text-muted-foreground"><span className="uppercase">{m.filename.split(".").pop()}</span><span>{fmtDate(m.uploaded)}</span></div>
              </div>
            </button>
          ))}
        </div>
      )}

      <Dialog open={!!cur} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="max-w-4xl gap-0 overflow-hidden rounded-2xl p-0">
          {cur && (
            <div className="grid md:grid-cols-[1.4fr_1fr]">
              <div className="grid place-items-center bg-muted p-4">
                {cur.type === "image" ? <img src={cur.url} alt={cur.alt} className="max-h-[60vh] rounded-xl object-contain" /> : <FileText className="h-16 w-16 text-muted-foreground" />}
              </div>
              <div className="max-h-[80vh] space-y-3 overflow-y-auto p-6">
                <DialogTitle className="truncate">{cur.filename}</DialogTitle>
                <div className="text-xs text-muted-foreground">{cur.size} · Uploaded {fmtDate(cur.uploaded)}</div>
                <div><Label className="text-xs">File URL</Label><div className="mt-1 flex gap-2"><Input readOnly value={cur.url} className="text-xs" /><Button size="icon" variant="outline" className="shrink-0" aria-label="Copy URL" onClick={() => { navigator.clipboard.writeText(cur.url); toast.success("URL copied"); }}><Copy className="h-4 w-4" /></Button></div></div>
                <div><Label className="text-xs">Alt text</Label><Input className="mt-1" value={cur.alt} onChange={(e) => upd({ alt: e.target.value })} /></div>
                <div><Label className="text-xs">Caption</Label><Input className="mt-1" value={cur.caption} onChange={(e) => upd({ caption: e.target.value })} /></div>
                <div><Label className="text-xs">Description</Label><Textarea className="mt-1" value={cur.description} onChange={(e) => upd({ description: e.target.value })} /></div>
                <div className="flex justify-between pt-2">
                  <Button variant="ghost" className="text-destructive" onClick={() => setDel(true)}><Trash2 className="h-4 w-4" /> Delete</Button>
                  <Button onClick={() => { setOpenId(null); toast.success("Media details saved"); }}>Done</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={del} onOpenChange={setDel} title="Delete this file?" description="It will be removed from your media library." onConfirm={() => { setCms((st) => ({ media: st.media.filter((m) => m.id !== openId) })); setDel(false); setOpenId(null); toast.success("Media deleted"); }} />
    </AdminLayout>
  );
}
