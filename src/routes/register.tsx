import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthShell, GoogleIcon } from "@/components/cms/AuthShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — Inkwell CMS" },
      { name: "description", content: "Create your Inkwell account and start publishing." },
      { property: "og:title", content: "Create account — Inkwell CMS" },
      { property: "og:description", content: "Create your Inkwell account and start publishing." },
    ],
  }),
  component: RegisterPage,
});

type Errors = Partial<Record<"name" | "email" | "password" | "confirm" | "terms", string>>;

function RegisterPage() {
  const navigate = useNavigate();
  const [f, setF] = useState({ name: "", email: "", password: "", confirm: "" });
  const [terms, setTerms] = useState(false);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const strength = [f.password.length >= 8, /[A-Z]/.test(f.password), /\d/.test(f.password), /[^A-Za-z0-9]/.test(f.password)].filter(Boolean).length;

  const finish = (msg: string) => {
    setLoading(true);
    setTimeout(() => { toast.success(msg); navigate({ to: "/" }); }, 700);
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Errors = {};
    if (f.name.trim().length < 2) err.name = "Enter your full name";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) err.email = "Enter a valid email address";
    if (f.password.length < 8) err.password = "Use at least 8 characters";
    if (f.confirm !== f.password) err.confirm = "Passwords don't match";
    if (!terms) err.terms = "Please accept the terms";
    setErrors(err);
    if (!Object.keys(err).length) finish("Account created successfully");
  };
  const field = (k: keyof typeof f, label: string, type = "text", ph = "") => (
    <div>
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} type={type} placeholder={ph} className="mt-1.5 h-11 rounded-xl" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
      {errors[k] && <p className="mt-1 text-xs text-destructive">{errors[k]}</p>}
    </div>
  );

  return (
    <AuthShell title="Create your account" subtitle="Start publishing beautiful stories in minutes." footer={<>Already have an account? <Link to="/login" className="font-semibold text-primary hover:underline">Log in</Link></>}>
      <Button variant="outline" className="h-11 w-full rounded-xl" onClick={() => finish("Signed up with Google")} disabled={loading}><GoogleIcon /> Sign up with Google</Button>
      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />or<div className="h-px flex-1 bg-border" /></div>
      <form onSubmit={submit} className="space-y-4" noValidate>
        {field("name", "Full name", "text", "Jane Doe")}
        {field("email", "Email", "email", "you@example.com")}
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative mt-1.5">
            <Input id="password" type={show ? "text" : "password"} placeholder="At least 8 characters" className="h-11 rounded-xl pr-10" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
          </div>
          {f.password && (
            <div className="mt-2 flex gap-1">
              {[0, 1, 2, 3].map((i) => <div key={i} className={cn("h-1 flex-1 rounded-full bg-muted", i < strength && (strength <= 1 ? "bg-destructive" : strength <= 2 ? "bg-warning" : "bg-success"))} />)}
            </div>
          )}
          {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
        </div>
        {field("confirm", "Confirm password", show ? "text" : "password", "Repeat password")}
        <div>
          <label className="flex items-start gap-2 text-sm text-muted-foreground"><Checkbox className="mt-0.5" checked={terms} onCheckedChange={(v) => setTerms(!!v)} /> I agree to the Terms of Service and Privacy Policy</label>
          {errors.terms && <p className="mt-1 text-xs text-destructive">{errors.terms}</p>}
        </div>
        <Button type="submit" className="h-11 w-full rounded-xl" disabled={loading}>{loading && <Loader2 className="h-4 w-4 animate-spin" />} Create account</Button>
      </form>
    </AuthShell>
  );
}
