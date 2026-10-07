import { useRef } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { setCms, uid, useCms, type Media } from "@/lib/cms-store";

export function addFiles(files: FileList | File[]) {
  const items: Media[] = Array.from(files).map((f) => ({
    id: uid(),
    url: URL.createObjectURL(f),
    filename: f.name,
    type: f.type.startsWith("image") ? "image" : f.type.startsWith("video") ? "video" : "document",
    uploaded: new Date().toISOString(),
    alt: "",
    caption: "",
    description: "",
    size: `${Math.max(1, Math.round(f.size / 1024))}KB`,
  }));
  setCms((s) => ({ media: [...items, ...s.media] }));
  toast.success(items.length > 1 ? `${items.length} files uploaded` : "Media uploaded");
  return items;
}

export function MediaPicker({ open, onOpenChange, onSelect }: { open: boolean; onOpenChange: (o: boolean) => void; onSelect: (url: string) => void }) {
  const s = useCms();
  const ref = useRef<HTMLInputElement>(null);
  const images = s.media.filter((m) => m.type === "image");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-2xl">
        <DialogHeader className="flex-row items-center justify-between space-y-0 pr-8">
          <DialogTitle>Media Library</DialogTitle>
          <Button size="sm" variant="outline" className="rounded-lg" onClick={() => ref.current?.click()}>
            <Upload className="h-4 w-4" /> Upload
          </Button>
          <input ref={ref} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && addFiles(e.target.files)} />
        </DialogHeader>
        <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-4">
          {images.map((m) => (
            <button
              key={m.id}
              onClick={() => { onSelect(m.url); onOpenChange(false); }}
              className="group overflow-hidden rounded-xl border transition hover:ring-2 hover:ring-primary"
            >
              <img src={m.url} alt={m.alt} className="aspect-[4/3] w-full object-cover transition group-hover:scale-105" />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
