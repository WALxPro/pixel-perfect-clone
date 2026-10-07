import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Facebook, Link2, Linkedin, Twitter } from "lucide-react";
import { toast } from "sonner";
import { BlogShell } from "@/components/cms/BlogShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fmtDate, readingTime, setCms, uid, useCms, userById } from "@/lib/cms-store";

export const Route = createFileRoute("/blog/$slug")({
  head: () => ({
    meta: [
      { title: "Article — Inkwell" },
      { name: "description", content: "Read the full article on Inkwell." },
      { property: "og:title", content: "Article — Inkwell" },
      { property: "og:description", content: "Read the full article on Inkwell." },
      { property: "og:type", content: "article" },
    ],
  }),
  component: Article,
});

function Article() {
  const { slug } = Route.useParams();
  const s = useCms();
  const [form, setForm] = useState({ name: "", email: "", text: "" });
  const post = s.posts.find((p) => p.slug === slug);
  if (!post)
    return (
      <BlogShell>
        <div className="py-32 text-center"><h1 className="font-serif text-3xl font-bold">Article not found</h1><Link to="/blog" className="mt-4 inline-block text-primary">Back to blog</Link></div>
      </BlogShell>
    );
  const author = userById(s, post.authorId);
  const related = s.posts.filter((p) => p.status === "published" && p.id !== post.id && p.category === post.category).slice(0, 3);
  const comments = s.comments.filter((c) => c.postId === post.id && c.status === "approved");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.text) return toast.error("Name and comment are required");
    const approved = !s.settings.requireApproval;
    setCms((st) => ({ comments: [{ id: uid(), name: form.name, email: form.email, avatar: `https://i.pravatar.cc/150?u=${form.name}`, text: form.text, postId: post.id, date: new Date().toISOString(), status: approved ? "approved" : "pending" }, ...st.comments] }));
    setForm({ name: "", email: "", text: "" });
    toast.success(approved ? "Comment posted" : "Thanks! Your comment is awaiting moderation.");
  };

  return (
    <BlogShell>
      {post.status !== "published" && <div className="bg-warning-soft py-2 text-center text-sm font-medium text-warning">Preview — this post is currently a {post.status}</div>}
      <article className="mx-auto max-w-3xl px-4 pt-12 sm:px-6">
        <Link to="/blog" search={{ category: post.category }} className="text-xs font-semibold uppercase tracking-widest text-primary">{post.category}</Link>
        <h1 className="mt-3 font-serif text-4xl font-bold leading-tight tracking-tight sm:text-5xl">{post.title || "(Untitled)"}</h1>
        <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
          {author && <img src={author.avatar} alt="" className="h-10 w-10 rounded-full" />}
          <div><div className="font-medium text-foreground">{author?.name}</div><div>{fmtDate(post.date)} · {readingTime(post.content)} min read</div></div>
        </div>
      </article>
      {post.image && <div className="mx-auto mt-10 max-w-5xl px-4 sm:px-6"><img src={post.image} alt="" className="aspect-[2/1] w-full rounded-3xl object-cover" /></div>}
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="prose-cms mt-10 text-[17px]" dangerouslySetInnerHTML={{ __html: post.content }} />
        {post.tags.length > 0 && <div className="mt-8 flex flex-wrap gap-2">{post.tags.map((t) => <span key={t} className="rounded-full bg-muted px-3 py-1 text-xs font-medium">#{t}</span>)}</div>}
        <div className="mt-8 flex items-center gap-2 border-y py-4">
          <span className="mr-2 text-sm font-medium">Share</span>
          {[Twitter, Facebook, Linkedin].map((I, i) => <Button key={i} variant="outline" size="icon" className="rounded-full" onClick={() => toast("Sharing opens in a new window on your live site")}><I className="h-4 w-4" /></Button>)}
          <Button variant="outline" size="icon" className="rounded-full" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied"); }}><Link2 className="h-4 w-4" /></Button>
        </div>

        <section className="mt-12">
          <h2 className="font-serif text-2xl font-bold">Comments ({comments.length})</h2>
          {s.settings.commentsEnabled ? (
            <form onSubmit={submit} className="mt-6 space-y-3 rounded-2xl border p-5">
              <div className="grid gap-3 sm:grid-cols-2"><Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <Textarea placeholder="Share your thoughts..." value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
              <Button type="submit">Post comment</Button>
            </form>
          ) : <p className="mt-4 text-sm text-muted-foreground">Comments are closed.</p>}
          <div className="mt-8 space-y-6">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3"><img src={c.avatar} alt="" className="h-10 w-10 rounded-full" /><div><div className="text-sm"><b>{c.name}</b> <span className="text-muted-foreground">· {fmtDate(c.date)}</span></div><p className="mt-1 text-sm leading-relaxed">{c.text}</p></div></div>
            ))}
          </div>
        </section>
      </div>

      {related.length > 0 && (
        <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Related posts</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {related.map((p) => (
              <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }} className="group">
                <div className="overflow-hidden rounded-2xl"><img src={p.image} alt="" className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-105" /></div>
                <h3 className="mt-3 font-serif text-lg font-bold leading-snug group-hover:text-primary">{p.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </BlogShell>
  );
}
