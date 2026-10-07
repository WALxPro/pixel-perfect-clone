import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlignCenter, AlignLeft, AlignRight, ArrowLeft, Bold, Code, Eye, Heading1, Heading2, Image as ImageIcon, Italic,
  Link2, List, ListOrdered, Plus, Quote, Redo2, Underline, Undo2, Video, X,
} from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/cms/AdminLayout";
import { MediaPicker } from "@/components/cms/MediaPicker";
import { Panel, StatusBadge } from "@/components/cms/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { savePost, setCms, slugify, uid, useCms, type Post } from "@/lib/cms-store";
import { cn } from "@/lib/utils";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Panel className="p-5">
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      <div className="space-y-3">{children}</div>
    </Panel>
  );
}

export function PostEditor({ initial }: { initial: Post }) {
  const s = useCms();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post>(initial);
  const [slugTouched, setSlugTouched] = useState(!!initial.slug);
  const [picker, setPicker] = useState<null | "featured" | "inline">(null);
  const [tagInput, setTagInput] = useState("");
  const [newCat, setNewCat] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const isNew = !s.posts.some((p) => p.id === initial.id);

  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = initial.content;
  }, [initial.id]);

  const up = (patch: Partial<Post>) => setPost((p) => ({ ...p, ...patch }));
  const exec = (cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
  };

  const persist = (status: Post["status"], msg: string) => {
    if (!post.title.trim()) return toast.error("Please add a title first");
    const final: Post = {
      ...post,
      status,
      slug: post.slug || slugify(post.title),
      content: editorRef.current?.innerHTML ?? post.content,
      date: status === "published" && post.status !== "published" && new Date(post.date) > new Date() ? new Date().toISOString() : post.date,
    };
    savePost(final);
    setPost(final);
    toast.success(msg);
    if (isNew) navigate({ to: "/posts/$id", params: { id: final.id }, replace: true });
  };

  const isFuture = new Date(post.date) > new Date();
  const publish = () => (isFuture ? persist("scheduled", "Post scheduled successfully") : persist("published", "Post published successfully"));
  const preview = () => {
    persist(post.status === "trash" ? "draft" : post.status, "Saved — opening preview");
    navigate({ to: "/blog/$slug", params: { slug: post.slug || slugify(post.title) } });
  };

  const addTag = (t: string) => {
    const name = t.trim().replace(/,$/, "");
    if (!name || post.tags.includes(name)) return;
    up({ tags: [...post.tags, name] });
    if (!s.tags.some((x) => x.name.toLowerCase() === name.toLowerCase())) setCms((st) => ({ tags: [...st.tags, { id: uid(), name, slug: slugify(name) }] }));
    setTagInput("");
  };

  const tools: { icon: typeof Bold; label: string; run: () => void }[][] = [
    [{ icon: Undo2, label: "Undo", run: () => exec("undo") }, { icon: Redo2, label: "Redo", run: () => exec("redo") }],
    [{ icon: Heading1, label: "Heading 1", run: () => exec("formatBlock", "<h2>") }, { icon: Heading2, label: "Heading 2", run: () => exec("formatBlock", "<h3>") }],
    [{ icon: Bold, label: "Bold", run: () => exec("bold") }, { icon: Italic, label: "Italic", run: () => exec("italic") }, { icon: Underline, label: "Underline", run: () => exec("underline") }],
    [
      { icon: Link2, label: "Link", run: () => { const u = prompt("Link URL"); if (u) exec("createLink", u); } },
      { icon: Quote, label: "Blockquote", run: () => exec("formatBlock", "<blockquote>") },
      { icon: Code, label: "Code block", run: () => exec("formatBlock", "<pre>") },
    ],
    [{ icon: List, label: "Bullet list", run: () => exec("insertUnorderedList") }, { icon: ListOrdered, label: "Ordered list", run: () => exec("insertOrderedList") }],
    [{ icon: AlignLeft, label: "Align left", run: () => exec("justifyLeft") }, { icon: AlignCenter, label: "Align center", run: () => exec("justifyCenter") }, { icon: AlignRight, label: "Align right", run: () => exec("justifyRight") }],
    [
      { icon: ImageIcon, label: "Image", run: () => setPicker("inline") },
      {
        icon: Video, label: "Video embed", run: () => {
          const u = prompt("YouTube URL");
          const id = u?.match(/(?:v=|youtu\.be\/)([\w-]{11})/)?.[1];
          if (id) exec("insertHTML", `<iframe src="https://www.youtube.com/embed/${id}" allowfullscreen></iframe><p></p>`);
          else if (u) toast.error("Please paste a valid YouTube link");
        },
      },
    ],
  ];

  const slug = post.slug || slugify(post.title);
  return (
    <AdminLayout wide>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="rounded-xl"><Link to="/posts" aria-label="Back"><ArrowLeft className="h-5 w-5" /></Link></Button>
          <div>
            <h1 className="text-xl font-bold">{isNew ? "New Post" : "Edit Post"}</h1>
            <div className="mt-0.5"><StatusBadge status={post.status} /></div>
          </div>
        </div>
        <div className="hidden gap-2 sm:flex">
          <Button variant="ghost" className="rounded-xl" onClick={preview}><Eye className="h-4 w-4" /> Preview</Button>
          <Button variant="outline" className="rounded-xl" onClick={() => persist("draft", "Draft saved")}>Save Draft</Button>
          <Button className="rounded-xl" onClick={publish}>{isFuture ? "Schedule" : post.status === "published" ? "Update" : "Publish"}</Button>
        </div>
      </div>

      <div className="grid gap-6 pb-24 lg:grid-cols-[1fr_340px] lg:pb-0">
        <div className="min-w-0">
          <Panel className="overflow-hidden">
            <input
              value={post.title}
              onChange={(e) => up({ title: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })}
              placeholder="Enter your post title..."
              className="w-full bg-transparent px-6 pb-2 pt-6 font-serif text-3xl font-bold tracking-tight outline-none placeholder:text-muted-foreground/50 sm:px-10 sm:pt-8 sm:text-4xl"
            />
            <div className="sticky top-16 z-10 flex flex-wrap items-center gap-1 border-y bg-card/95 px-3 py-2 backdrop-blur sm:px-8">
              {tools.map((g, gi) => (
                <div key={gi} className={cn("flex gap-0.5", gi > 0 && "border-l pl-1")}>
                  {g.map((t) => (
                    <button key={t.label} title={t.label} aria-label={t.label} onMouseDown={(e) => { e.preventDefault(); t.run(); }} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-accent-foreground">
                      <t.icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              ))}
            </div>
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              data-placeholder="Start writing your story..."
              className="prose-cms min-h-[480px] px-6 py-6 text-[16px] sm:px-10"
            />
          </Panel>
        </div>

        <div className="space-y-4">
          <Section title="Publish">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select value={post.status} onValueChange={(v) => up({ status: v as Post["status"] })}>
                  <SelectTrigger className="mt-1 rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>{["draft", "published", "scheduled"].map((x) => <SelectItem key={x} value={x} className="capitalize">{x}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Visibility</Label>
                <Select value={post.visibility} onValueChange={(v) => up({ visibility: v as Post["visibility"] })}>
                  <SelectTrigger className="mt-1 rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="public">Public</SelectItem><SelectItem value="private">Private</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Publish date</Label>
              <Input type="datetime-local" className="mt-1 rounded-lg" value={new Date(new Date(post.date).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)} onChange={(e) => e.target.value && up({ date: new Date(e.target.value).toISOString() })} />
              {isFuture && <p className="mt-1 text-xs text-info">This post will be scheduled.</p>}
            </div>
          </Section>

          <Section title="Featured Image">
            {post.image ? (
              <div className="group relative overflow-hidden rounded-xl">
                <img src={post.image} alt="" className="aspect-video w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-foreground/40 opacity-0 transition group-hover:opacity-100">
                  <Button size="sm" variant="secondary" onClick={() => setPicker("featured")}>Replace</Button>
                  <Button size="sm" variant="destructive" onClick={() => up({ image: "" })}>Remove</Button>
                </div>
              </div>
            ) : (
              <button onClick={() => setPicker("featured")} className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-sm text-muted-foreground transition hover:border-primary hover:text-primary">
                <ImageIcon className="h-6 w-6" /> Select featured image
              </button>
            )}
          </Section>

          <Section title="Category">
            <Select value={post.category} onValueChange={(v) => up({ category: v })}>
              <SelectTrigger className="rounded-lg"><SelectValue placeholder="Choose category" /></SelectTrigger>
              <SelectContent>{s.categories.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); const n = newCat.trim(); if (!n) return; setCms((st) => ({ categories: [...st.categories, { id: uid(), name: n, slug: slugify(n), description: "", created: new Date().toISOString() }] })); up({ category: n }); setNewCat(""); toast.success("Category created"); }}>
              <Input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="New category" className="h-9 rounded-lg" />
              <Button type="submit" size="icon" variant="outline" className="h-9 w-9 shrink-0 rounded-lg" aria-label="Add category"><Plus className="h-4 w-4" /></Button>
            </form>
          </Section>

          <Section title="Tags">
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 rounded-lg bg-accent px-2 py-1 text-xs font-medium text-accent-foreground">
                  {t}<button onClick={() => up({ tags: post.tags.filter((x) => x !== t) })} aria-label={`Remove ${t}`}><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
            <Input value={tagInput} list="tag-list" onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); } }} placeholder="Type a tag and press Enter" className="rounded-lg" />
            <datalist id="tag-list">{s.tags.map((t) => <option key={t.id} value={t.name} />)}</datalist>
          </Section>

          <Section title="Excerpt">
            <Textarea value={post.excerpt} onChange={(e) => up({ excerpt: e.target.value })} placeholder="A short summary of your post..." rows={3} className="rounded-lg" />
          </Section>

          <Section title="SEO">
            <div><Label className="text-xs text-muted-foreground">SEO title</Label><Input className="mt-1 rounded-lg" value={post.seoTitle} onChange={(e) => up({ seoTitle: e.target.value })} placeholder={post.title || "SEO title"} /></div>
            <div><Label className="text-xs text-muted-foreground">Meta description</Label><Textarea rows={2} className="mt-1 rounded-lg" value={post.metaDescription} onChange={(e) => up({ metaDescription: e.target.value })} /><div className="mt-1 text-right text-[11px] text-muted-foreground">{post.metaDescription.length}/160</div></div>
            <div><Label className="text-xs text-muted-foreground">URL slug</Label><Input className="mt-1 rounded-lg" value={post.slug} onChange={(e) => { setSlugTouched(true); up({ slug: slugify(e.target.value) }); }} /></div>
            <div className="rounded-xl border bg-background p-3">
              <div className="text-[11px] text-muted-foreground">Search preview</div>
              <div className="mt-1 truncate text-xs text-success">{s.settings.siteUrl.replace("https://", "")} › blog › {slug || "your-post"}</div>
              <div className="truncate text-[15px] font-medium text-info">{post.seoTitle || post.title || "Your post title"}</div>
              <div className="line-clamp-2 text-xs text-muted-foreground">{post.metaDescription || post.excerpt || "Add a meta description to control how this post appears in search results."}</div>
            </div>
          </Section>

          <Section title="Author">
            <Select value={post.authorId} onValueChange={(v) => up({ authorId: v })}>
              <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
              <SelectContent>{s.users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
            </Select>
          </Section>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t bg-card/95 p-3 backdrop-blur sm:hidden">
        <Button variant="outline" className="flex-1 rounded-xl" onClick={() => persist("draft", "Draft saved")}>Save Draft</Button>
        <Button className="flex-1 rounded-xl" onClick={publish}>{isFuture ? "Schedule" : "Publish"}</Button>
      </div>

      <MediaPicker
        open={!!picker}
        onOpenChange={(o) => !o && setPicker(null)}
        onSelect={(url) => (picker === "featured" ? up({ image: url }) : exec("insertImage", url))}
      />
    </AdminLayout>
  );
}
