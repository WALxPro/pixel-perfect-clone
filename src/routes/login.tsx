import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthShell, GoogleIcon } from "@/components/cms/AuthShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Inkwell CMS" },
      { name: "description", content: "Log in to manage your Inkwell blog." },
      { property: "og:title", content: "Log in — Inkwell CMS" },
      { property: "og:description", content: "Log in to manage your Inkwell blog." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const finish = (msg: string) => {
    setLoading(true);
    setTimeout(() => { toast.success(msg); navigate({ to: "/" }); }, 700);
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) err.email = "Enter a valid email address";
    if (password.length < 6) err.password = "Password must be at least 6 characters";
    setErrors(err);
    if (!Object.keys(err).length) finish("Welcome back!");
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to your dashboard to keep writing." footer={<>Don't have an account? <Link to="/register" className="font-semibold text-primary hover:underline">Create one</Link></>}>
      <Button variant="outline" className="h-11 w-full rounded-xl" onClick={() => finish("Signed in with Google")} disabled={loading}><GoogleIcon /> Continue with Google</Button>
      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />or<div className="h-px flex-1 bg-border" /></div>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" className="mt-1.5 h-11 rounded-xl" value={email} onChange={(e) => setEmail(e.target.value)} />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button type="button" className="text-xs font-medium text-primary hover:underline" onClick={() => toast("Password reset link sent (demo)")}>Forgot password?</button>
          </div>
          <div className="relative mt-1.5">
            <Input id="password" type={show ? "text" : "password"} autoComplete="current-password" placeholder="••••••••" className="h-11 rounded-xl pr-10" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground"><Checkbox /> Remember me</label>
        <Button type="submit" className="h-11 w-full rounded-xl" disabled={loading}>{loading && <Loader2 className="h-4 w-4 animate-spin" />} Log in</Button>
      </form>
    </AuthShell>
  );
}
