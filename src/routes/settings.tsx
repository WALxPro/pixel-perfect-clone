import { useState, type ReactNode } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Globe, MessageSquare, Palette, PenLine, Search, BookOpen, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/cms/AdminLayout";
import { PageHeader, Panel } from "@/components/cms/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setCms, useCms, type Settings } from "@/lib/cms-store";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "general", label: "General", icon: Globe },
  { id: "writing", label: "Writing", icon: PenLine },
  { id: "reading", label: "Reading", icon: BookOpen },
  { id: "comments", label: "Comments", icon: MessageSquare },
  { id: "seo", label: "SEO", icon: Search },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "account", label: "Account", icon: UserCircle },
] as const;
type TabId = (typeof TABS)[number]["id"];

export const Route = createFileRoute("/settings")({
  validateSearch: (s: Record<string, unknown>): { tab?: TabId } => (TABS.some((t) => t.id === s.tab) ? { tab: s.tab as TabId } : {}),
  head: () => ({
    meta: [
      { title: "Settings — Inkwell CMS" },
      { name: "description", content: "Configure your blog, comments, SEO, appearance and account." },
      { property: "og:title", content: "Settings — Inkwell CMS" },
      { property: "og:description", content: "Configure your blog, comments, SEO, appearance and account." },
    ],
  }),
  component: SettingsPage,
});

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="grid gap-2 border-b py-5 last:border-0 sm:grid-cols-[220px_1fr] sm:gap-6">
      <div><Label className="text-sm font-medium">{label}</Label>{hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}</div>
      <div>{children}</div>
    </div>
  );
}

function SettingsPage() {
  const s = useCms();
  const { tab = "general" } = Route.useSearch();
  const navigate = useNavigate({ from: "/settings" });
  const [d, setD] = useState<Settings>(s.settings);
  const me = s.users[0];
  const [acct, setAcct] = useState({ name: me.name, email: me.email, password: "" });
  const up = (p: Partial<Settings>) => setD({ ...d, ...p });
  const toggle = (k: keyof Settings, label: string, hint: string) => (
    <Field label={label} hint={hint}><Switch checked={d[k] as boolean} onCheckedChange={(v) => up({ [k]: v } as Partial<Settings>)} /></Field>
  );
  const save = () => {
    setCms((st) => ({ settings: d, users: tab === "account" ? st.users.map((u) => (u.id === me.id ? { ...u, name: acct.name, email: acct.email } : u)) : st.users }));
    toast.success("Settings saved");
  };
  const upload = (label: string) => <div className="flex items-center gap-3"><div className="grid h-14 w-14 place-items-center rounded-xl bg-gradient-primary text-primary-foreground"><PenLine className="h-6 w-6" /></div><Button variant="outline" size="sm" onClick={() => toast(`${label} upload coming soon in this demo`)}>Change</Button></div>;

  return (
    <AdminLayout>
      <PageHeader title="Settings" description="Manage how your blog works and looks." />
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => navigate({ search: { tab: t.id } })} className={cn("flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition", tab === t.id ? "bg-card text-foreground shadow-soft ring-1 ring-border" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
              <t.icon className={cn("h-4 w-4", tab === t.id && "text-primary")} /> {t.label}
            </button>
          ))}
        </nav>
        <Panel className="px-6 py-2">
          {tab === "general" && (<>
            <Field label="Website name"><Input value={d.siteName} onChange={(e) => up({ siteName: e.target.value })} /></Field>
            <Field label="Website description"><Textarea value={d.siteDescription} onChange={(e) => up({ siteDescription: e.target.value })} /></Field>
            <Field label="Logo">{upload("Logo")}</Field>
            <Field label="Favicon">{upload("Favicon")}</Field>
            <Field label="Website URL"><Input value={d.siteUrl} onChange={(e) => up({ siteUrl: e.target.value })} /></Field>
            <Field label="Admin email" hint="Used for system notifications."><Input type="email" value={d.adminEmail} onChange={(e) => up({ adminEmail: e.target.value })} /></Field>
          </>)}
          {tab === "writing" && (<>
            <Field label="Default post category">
              <Select value={d.defaultCategory} onValueChange={(v) => up({ defaultCategory: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{s.categories.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select>
            </Field>
            <Field label="Editor" hint="Rich text editor with formatting toolbar."><Select defaultValue="rich"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="rich">Rich text</SelectItem><SelectItem value="minimal">Minimal</SelectItem></SelectContent></Select></Field>
          </>)}
          {tab === "reading" && (<>
            <Field label="Posts per page"><Input type="number" min={1} max={50} value={d.postsPerPage} onChange={(e) => up({ postsPerPage: Number(e.target.value) })} className="w-28" /></Field>
            <Field label="Homepage displays"><Select value={d.homepage} onValueChange={(v) => up({ homepage: v as Settings["homepage"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="latest">Latest posts</SelectItem><SelectItem value="static">A static page</SelectItem></SelectContent></Select></Field>
          </>)}
          {tab === "comments" && (<>
            {toggle("commentsEnabled", "Enable comments", "Allow readers to comment on posts.")}
            {toggle("requireApproval", "Require approval", "New comments wait for moderation.")}
            {toggle("guestComments", "Allow guest comments", "Readers can comment without an account.")}
            {toggle("emailNotifications", "Email notifications", "Get an email for every new comment.")}
          </>)}
          {tab === "seo" && (<>
            <Field label="Default meta title"><Input value={d.metaTitle} onChange={(e) => up({ metaTitle: e.target.value })} /></Field>
            <Field label="Default meta description"><Textarea value={d.metaDescription} onChange={(e) => up({ metaDescription: e.target.value })} /></Field>
            <Field label="Social sharing image" hint="1200×630 recommended."><img src={s.media[0]?.url} alt="" className="aspect-[1200/630] w-full max-w-sm rounded-xl object-cover" /></Field>
          </>)}
          {tab === "appearance" && (<>
            <Field label="Logo">{upload("Logo")}</Field>
            <Field label="Primary color"><div className="flex items-center gap-3"><span className="h-9 w-9 rounded-lg bg-primary ring-1 ring-border" /><span className="text-sm text-muted-foreground">Indigo</span></div></Field>
            {toggle("darkMode", "Dark mode", "Offer a dark theme on the public blog.")}
            <Field label="Blog layout">
              <div className="grid max-w-sm grid-cols-2 gap-3">
                {(["grid", "list"] as const).map((l) => (
                  <button key={l} onClick={() => up({ layout: l })} className={cn("rounded-xl border p-3 text-sm font-medium capitalize transition", d.layout === l ? "border-primary bg-accent text-accent-foreground ring-2 ring-primary/20" : "hover:bg-muted")}>{l}</button>
                ))}
              </div>
            </Field>
          </>)}
          {tab === "account" && (<>
            <Field label="Profile image"><div className="flex items-center gap-3"><img src={me.avatar} alt="" className="h-14 w-14 rounded-full" /><Button variant="outline" size="sm" onClick={() => toast("Photo upload coming soon in this demo")}>Change</Button></div></Field>
            <Field label="Name"><Input value={acct.name} onChange={(e) => setAcct({ ...acct, name: e.target.value })} /></Field>
            <Field label="Email"><Input type="email" value={acct.email} onChange={(e) => setAcct({ ...acct, email: e.target.value })} /></Field>
            <Field label="New password" hint="Leave blank to keep current."><Input type="password" value={acct.password} onChange={(e) => setAcct({ ...acct, password: e.target.value })} /></Field>
          </>)}
          <div className="flex justify-end gap-2 py-5">
            <Button variant="outline" onClick={() => setD(s.settings)}>Reset</Button>
            <Button onClick={save}>Save changes</Button>
          </div>
        </Panel>
      </div>
    </AdminLayout>
  );
}
