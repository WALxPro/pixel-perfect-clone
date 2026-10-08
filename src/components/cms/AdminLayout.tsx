import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  ExternalLink,
  FileText,
  FolderOpen,
  Image,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  PenLine,
  Search,
  Settings,
  Tag,
  UserCog,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCms } from "@/lib/cms-store";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/posts", label: "Posts", icon: FileText },
  { to: "/categories", label: "Categories", icon: FolderOpen },
  { to: "/tags", label: "Tags", icon: Tag },
  { to: "/media", label: "Media Library", icon: Image },
  { to: "/comments", label: "Comments", icon: MessageSquare },
  { to: "/users", label: "Users", icon: Users },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const s = useCms();
  const pending = s.comments.filter((c) => c.status === "pending").length;
  const me = s.users[0];
  const isActive = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary text-primary-foreground">
          <PenLine className="h-4 w-4" />
        </div>
        <div>
          <div className="text-[15px] font-bold leading-none">{s.settings.siteName}</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">Blog CMS</div>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        <div className="px-3 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Menu</div>
        {nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              isActive(n.to) ? "bg-accent text-accent-foreground" : "text-sidebar-foreground hover:bg-muted",
            )}
          >
            <n.icon className={cn("h-[18px] w-[18px]", isActive(n.to) ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
            {n.label}
            {n.to === "/comments" && pending > 0 && (
              <span className="ml-auto rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">{pending}</span>
            )}
          </Link>
        ))}
      </nav>
      <div className="space-y-0.5 border-t p-3">
        <div className="flex items-center gap-3 rounded-xl p-2">
          <Avatar className="h-9 w-9">
            <AvatarImage src={me.avatar} />
            <AvatarFallback>{me.name[0]}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{me.name}</div>
            <div className="truncate text-xs text-muted-foreground">{me.role}</div>
          </div>
        </div>
        <Link to="/settings" search={{ tab: "account" }} onClick={onNavigate} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-sidebar-foreground hover:bg-muted">
          <UserCog className="h-[18px] w-[18px] text-muted-foreground" /> Profile settings
        </Link>
        <button onClick={() => { toast("You have been logged out"); navigate({ to: "/login" }); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-sidebar-foreground hover:bg-muted">
          <LogOut className="h-[18px] w-[18px] text-muted-foreground" /> Logout
        </button>
      </div>
    </div>
  );
}

export function AdminLayout({ children, wide }: { children: ReactNode; wide?: boolean }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const s = useCms();
  const me = s.users[0];
  const recent = s.comments.slice(0, 4);
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-sidebar lg:block">
        <SidebarBody />
      </aside>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarBody onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
          <form
            className="relative max-w-md flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/posts", search: { q } });
            }}
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search posts..."
              className="h-10 w-full rounded-xl border bg-card pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </form>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden rounded-xl sm:inline-flex" asChild>
              <Link to="/blog">
                <ExternalLink className="h-4 w-4" /> View Website
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-xl" aria-label="Notifications">
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 rounded-xl">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {recent.map((c) => (
                  <DropdownMenuItem key={c.id} onClick={() => navigate({ to: "/comments" })} className="items-start gap-3 py-2">
                    <img src={c.avatar} alt="" className="h-8 w-8 rounded-full" />
                    <div className="min-w-0 text-xs">
                      <div><b>{c.name}</b> left a comment</div>
                      <div className="truncate text-muted-foreground">{c.text}</div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full ring-offset-2 transition hover:ring-2 hover:ring-primary/30">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={me.avatar} />
                    <AvatarFallback>{me.name[0]}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-xl">
                <DropdownMenuLabel>
                  <div>{me.name}</div>
                  <div className="text-xs font-normal text-muted-foreground">{me.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/settings", search: { tab: "account" } })}>Profile settings</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/blog" })}>View website</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { toast("You have been logged out"); navigate({ to: "/login" }); }}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className={cn("mx-auto px-4 py-6 sm:px-6 lg:py-8", wide ? "max-w-[1400px]" : "max-w-7xl")}>{children}</main>
      </div>
    </div>
  );
}
