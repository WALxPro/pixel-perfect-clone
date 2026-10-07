import { useSyncExternalStore } from "react";

export type PostStatus = "published" | "draft" | "scheduled" | "trash";
export type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image: string;
  authorId: string;
  category: string;
  tags: string[];
  status: PostStatus;
  visibility: "public" | "private";
  views: number;
  date: string;
  seoTitle: string;
  metaDescription: string;
};
export type Category = { id: string; name: string; slug: string; description: string; created: string };
export type Tag = { id: string; name: string; slug: string };
export type Media = {
  id: string;
  url: string;
  filename: string;
  type: "image" | "video" | "document";
  uploaded: string;
  alt: string;
  caption: string;
  description: string;
  size: string;
};
export type CommentStatus = "pending" | "approved" | "spam" | "trash";
export type Comment = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  text: string;
  postId: string;
  date: string;
  status: CommentStatus;
};
export type Role = "Admin" | "Editor" | "Author" | "Contributor";
export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  status: "active" | "inactive";
  joined: string;
};
export type Settings = {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;
  defaultCategory: string;
  postsPerPage: number;
  homepage: "latest" | "static";
  commentsEnabled: boolean;
  requireApproval: boolean;
  guestComments: boolean;
  emailNotifications: boolean;
  metaTitle: string;
  metaDescription: string;
  layout: "grid" | "list";
  darkMode: boolean;
};

const img = (id: string) => `https://images.unsplash.com/photo-${id}?w=1200&q=80&auto=format&fit=crop`;
export const IMAGES = [
  img("1499750310107-5fef28a66643"),
  img("1486312338219-ce68d2c6f44d"),
  img("1517694712202-14dd9538aa97"),
  img("1498050108023-c5249f4df085"),
  img("1461749280684-dccba630e2f6"),
  img("1504384308090-c894fdcc538d"),
  img("1522202176988-66273c2fd55f"),
  img("1519389950473-47ba0277781c"),
  img("1531297484001-80022131f5a1"),
  img("1488590528505-98d2b5aba04b"),
  img("1460925895917-afdab827c52f"),
  img("1551288049-bebda4e38f71"),
];
const av = (n: number) => `https://i.pravatar.cc/150?img=${n}`;

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
export const uid = () => Math.random().toString(36).slice(2, 10);
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

const body = (topic: string) => `<p>${topic} has changed dramatically over the last few years. In this article we break down what actually matters, what you can safely ignore, and how to build a workflow that lasts.</p>
<h2>Why it matters</h2>
<p>Teams that invest early in the fundamentals ship faster, argue less and spend more time on the work that moves the needle. The difference compounds over months.</p>
<blockquote>Simplicity is not the absence of features. It is the presence of focus.</blockquote>
<h2>A practical approach</h2>
<ul><li>Start with a clear outcome and work backwards.</li><li>Measure the few metrics that reflect real progress.</li><li>Review, prune and repeat every few weeks.</li></ul>
<p>None of this is glamorous, but it works. Pick one idea from this list and try it this week.</p>`;

const postSeed: [string, string, string[], PostStatus, number, number, string][] = [
  ["Designing Calm Interfaces in a Noisy World", "Design", ["UI", "UX"], "published", 12480, 2, "u1"],
  ["The Complete Guide to Modern CSS Layouts", "Development", ["CSS", "Frontend"], "published", 9832, 4, "u2"],
  ["How We Grew Our Newsletter to 50k Readers", "Marketing", ["Growth", "Email"], "published", 7621, 6, "u3"],
  ["Remote Work Rituals That Actually Stick", "Productivity", ["Remote", "Teams"], "draft", 0, 1, "u1"],
  ["TypeScript Patterns for Large Codebases", "Development", ["TypeScript", "Frontend"], "published", 15203, 9, "u2"],
  ["A Beginner's Guide to Content Strategy", "Marketing", ["Content", "SEO"], "scheduled", 0, -3, "u4"],
  ["Building a Personal Knowledge System", "Productivity", ["Notes", "Habits"], "published", 5410, 12, "u3"],
  ["Color Theory for Product Designers", "Design", ["UI", "Color"], "published", 8890, 15, "u1"],
  ["Why Your Startup Needs a Design System", "Design", ["UI", "Systems"], "draft", 0, 2, "u4"],
  ["SEO Basics Every Writer Should Know", "Marketing", ["SEO", "Content"], "published", 11002, 20, "u3"],
  ["Shipping Faster With Feature Flags", "Development", ["DevOps"], "published", 4320, 24, "u2"],
  ["The Art of Writing Clear Documentation", "Productivity", ["Writing"], "published", 3980, 30, "u4"],
];

const initial = {
  posts: postSeed.map(([title, category, tags, status, views, d, authorId], i): Post => ({
    id: `p${i + 1}`,
    title,
    slug: slugify(title),
    content: body(title),
    excerpt: `A practical, no-fluff look at ${title.toLowerCase()} — with examples you can apply today.`,
    image: IMAGES[i % IMAGES.length],
    authorId,
    category,
    tags,
    status,
    visibility: "public",
    views,
    date: daysAgo(d),
    seoTitle: title,
    metaDescription: `Learn about ${title.toLowerCase()} in this in-depth guide.`,
  })),
  categories: [
    ["Design", "Interfaces, systems and visual craft."],
    ["Development", "Code, tooling and engineering practices."],
    ["Marketing", "Growth, content and distribution."],
    ["Productivity", "Habits, workflows and focus."],
    ["News", "Product updates and announcements."],
  ].map(([name, description], i): Category => ({
    id: `c${i + 1}`,
    name,
    slug: slugify(name),
    description,
    created: daysAgo(200 - i * 20),
  })),
  tags: ["UI", "UX", "CSS", "Frontend", "Growth", "Email", "Remote", "Teams", "TypeScript", "Content", "SEO", "Notes", "Habits", "Color", "Systems", "DevOps", "Writing"].map(
    (name, i): Tag => ({ id: `t${i + 1}`, name, slug: slugify(name) }),
  ),
  media: IMAGES.map((url, i): Media => ({
    id: `m${i + 1}`,
    url,
    filename: `blog-image-${String(i + 1).padStart(2, "0")}.jpg`,
    type: "image",
    uploaded: daysAgo(i * 3),
    alt: "",
    caption: "",
    description: "",
    size: `${(180 + i * 37) % 900}KB`,
  })),
  comments: [
    ["Sarah Chen", 47, "This is exactly what I needed. The section on focus really resonated with me!", "p1", "approved"],
    ["Marcus Lee", 12, "Great breakdown. Would love a follow-up on container queries.", "p2", "pending"],
    ["Aisha Khan", 32, "We tried the newsletter tactics and saw a 30% lift in signups. Thank you!", "p3", "approved"],
    ["Tom Becker", 59, "Do you have any recommended tools for this?", "p5", "pending"],
    ["Buy Cheap Followers", 3, "Click here for cheap followers!!! www.spam.example", "p1", "spam"],
    ["Elena Rossi", 44, "Beautifully written. Sharing with my team.", "p8", "approved"],
    ["David Park", 15, "I disagree slightly on point two, but overall solid advice.", "p10", "pending"],
    ["Priya Sharma", 26, "The color palette examples are gorgeous.", "p8", "approved"],
  ].map(([name, a, text, postId, status], i): Comment => ({
    id: `cm${i + 1}`,
    name: name as string,
    email: `${(name as string).toLowerCase().split(" ")[0]}@example.com`,
    avatar: av(a as number),
    text: text as string,
    postId: postId as string,
    date: daysAgo(i * 0.7),
    status: status as CommentStatus,
  })),
  users: [
    ["Waleed Tariq", "Admin", 68, "active"],
    ["Olivia Martin", "Editor", 5, "active"],
    ["James Wilson", "Author", 13, "active"],
    ["Mia Johnson", "Contributor", 9, "inactive"],
  ].map(([name, role, a, status], i): User => ({
    id: `u${i + 1}`,
    name: name as string,
    email: `${(name as string).toLowerCase().replace(" ", ".")}@inkwell.blog`,
    avatar: av(a as number),
    role: role as Role,
    status: status as "active",
    joined: daysAgo(400 - i * 60),
  })),
  settings: {
    siteName: "Inkwell",
    siteDescription: "Thoughtful writing on design, code and work.",
    siteUrl: "https://inkwell.blog",
    adminEmail: "admin@inkwell.blog",
    defaultCategory: "Design",
    postsPerPage: 10,
    homepage: "latest",
    commentsEnabled: true,
    requireApproval: true,
    guestComments: false,
    emailNotifications: true,
    metaTitle: "Inkwell — Thoughtful writing",
    metaDescription: "Essays and guides on design, development and productivity.",
    layout: "grid",
    darkMode: false,
  } as Settings,
};

export type CmsState = typeof initial;
let state: CmsState = initial;
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function setCms(fn: (s: CmsState) => Partial<CmsState>) {
  state = { ...state, ...fn(state) };
  listeners.forEach((l) => l());
}
export function getCms() {
  return state;
}
export function useCms() {
  return useSyncExternalStore(subscribe, () => state, () => initial);
}

export const userById = (s: CmsState, id: string) => s.users.find((u) => u.id === id);
export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
export const fmtNum = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
export const readingTime = (html: string) =>
  Math.max(1, Math.round(html.replace(/<[^>]+>/g, " ").split(/\s+/).length / 200));

// Post actions
export function savePost(p: Post) {
  setCms((s) => ({
    posts: s.posts.some((x) => x.id === p.id) ? s.posts.map((x) => (x.id === p.id ? p : x)) : [p, ...s.posts],
  }));
}
export function duplicatePost(id: string) {
  const p = state.posts.find((x) => x.id === id);
  if (!p) return;
  const copy: Post = { ...p, id: uid(), title: `${p.title} (Copy)`, slug: `${p.slug}-copy`, status: "draft", views: 0, date: new Date().toISOString() };
  setCms((s) => ({ posts: [copy, ...s.posts] }));
}
export function setPostStatus(ids: string[], status: PostStatus) {
  setCms((s) => ({ posts: s.posts.map((p) => (ids.includes(p.id) ? { ...p, status } : p)) }));
}
export function deletePosts(ids: string[]) {
  setCms((s) => ({ posts: s.posts.filter((p) => !ids.includes(p.id)) }));
}
export function newPost(): Post {
  return {
    id: uid(),
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    image: "",
    authorId: "u1",
    category: state.settings.defaultCategory,
    tags: [],
    status: "draft",
    visibility: "public",
    views: 0,
    date: new Date().toISOString(),
    seoTitle: "",
    metaDescription: "",
  };
}
