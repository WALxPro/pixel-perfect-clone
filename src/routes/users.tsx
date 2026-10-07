import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PenSquare, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/cms/AdminLayout";
import { ConfirmDialog, PageHeader, Panel, StatusBadge } from "@/components/cms/ui-bits";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { fmtDate, setCms, uid, useCms, type Role, type User } from "@/lib/cms-store";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "Users — Inkwell CMS" },
      { name: "description", content: "Manage authors, editors and their roles." },
      { property: "og:title", content: "Users — Inkwell CMS" },
      { property: "og:description", content: "Manage authors, editors and their roles." },
    ],
  }),
  component: UsersPage,
});

const ROLES: Role[] = ["Admin", "Editor", "Author", "Contributor"];

function UsersPage() {
  const s = useCms();
  const [edit, setEdit] = useState<User | null>(null);
  const [del, setDel] = useState<User | null>(null);
  const posts = (id: string) => s.posts.filter((p) => p.authorId === id && p.status !== "trash").length;

  const save = () => {
    if (!edit?.name.trim() || !/^\S+@\S+\.\S+$/.test(edit.email)) return toast.error("Please enter a name and valid email");
    if (edit.id) {
      setCms((st) => ({ users: st.users.map((u) => (u.id === edit.id ? edit : u)) }));
      toast.success("User updated");
    } else {
      setCms((st) => ({ users: [...st.users, { ...edit, id: uid(), avatar: `https://i.pravatar.cc/150?u=${edit.email}` }] }));
      toast.success("User added");
    }
    setEdit(null);
  };
  const Row = ({ u }: { u: User }) => (
    <>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEdit(u)} aria-label="Edit"><PenSquare className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" disabled={u.id === "u1"} onClick={() => setDel(u)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
    </>
  );

  return (
    <AdminLayout>
      <PageHeader title="Users" description="People who can access and write for your blog." actions={<Button className="rounded-xl" onClick={() => setEdit({ id: "", name: "", email: "", avatar: "", role: "Author", status: "active", joined: new Date().toISOString() })}><Plus className="h-4 w-4" /> Add User</Button>} />
      <Panel className="overflow-hidden">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"><th className="px-5 py-3">User</th><th className="px-3 py-3">Role</th><th className="px-3 py-3 text-right">Posts</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Joined</th><th className="w-24" /></tr></thead>
            <tbody className="divide-y">
              {s.users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/40">
                  <td className="px-5 py-3"><div className="flex items-center gap-3"><img src={u.avatar} alt="" className="h-9 w-9 rounded-full" /><div><div className="font-semibold">{u.name}</div><div className="text-xs text-muted-foreground">{u.email}</div></div></div></td>
                  <td className="px-3 py-3"><span className="rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">{u.role}</span></td>
                  <td className="px-3 py-3 text-right tabular-nums">{posts(u.id)}</td>
                  <td className="px-3 py-3"><StatusBadge status={u.status} /></td>
                  <td className="px-3 py-3 text-muted-foreground">{fmtDate(u.joined)}</td>
                  <td className="px-3 py-3 text-right"><Row u={u} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="divide-y md:hidden">
          {s.users.map((u) => (
            <div key={u.id} className="flex items-center gap-3 p-4">
              <img src={u.avatar} alt="" className="h-10 w-10 rounded-full" />
              <div className="min-w-0 flex-1"><div className="font-semibold">{u.name}</div><div className="truncate text-xs text-muted-foreground">{u.email}</div><div className="mt-1.5 flex gap-2"><span className="rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">{u.role}</span><StatusBadge status={u.status} /></div></div>
              <Row u={u} />
            </div>
          ))}
        </div>
      </Panel>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>{edit?.id ? "Edit user" : "Add user"}</DialogTitle></DialogHeader>
          {edit && (
            <div className="space-y-4">
              <div><Label>Full name</Label><Input className="mt-1.5" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" className="mt-1.5" value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} /></div>
              <div><Label>Role</Label>
                <Select value={edit.role} onValueChange={(v) => setEdit({ ...edit, role: v as Role })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-xl border p-3"><div><div className="text-sm font-medium">Active</div><div className="text-xs text-muted-foreground">Inactive users can't sign in.</div></div><Switch checked={edit.status === "active"} onCheckedChange={(v) => setEdit({ ...edit, status: v ? "active" : "inactive" })} /></div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={save}>Save user</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={!!del} onOpenChange={(o) => !o && setDel(null)} title={`Remove ${del?.name}?`} description="Their posts will remain but they'll lose access." onConfirm={() => { setCms((st) => ({ users: st.users.filter((u) => u.id !== del?.id) })); setDel(null); toast.success("User deleted"); }} />
    </AdminLayout>
  );
}
