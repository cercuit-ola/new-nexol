import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, BriefcaseBusiness, Clock3, Plus, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

type EscrowStatus = "draft" | "awaiting_funding" | "funded" | "work_submitted" | "released" | "disputed" | "cancelled";

interface Escrow {
  id: string;
  creator_id: string;
  creator_email: string;
  counterparty_email: string;
  title: string;
  description: string;
  amount: number;
  token: "USDC" | "USDT";
  network: "base" | "base-sepolia";
  deadline: string | null;
  status: EscrowStatus;
  funding_tx_hash: string | null;
  created_at: string;
}

const statusLabel: Record<EscrowStatus, string> = {
  draft: "Draft",
  awaiting_funding: "Awaiting funding",
  funded: "Funded",
  work_submitted: "Work submitted",
  released: "Released",
  disputed: "Disputed",
  cancelled: "Cancelled",
};

const statusStyle: Record<EscrowStatus, string> = {
  draft: "bg-white/5 text-muted-foreground",
  awaiting_funding: "bg-amber-500/10 text-amber-300",
  funded: "bg-blue-500/10 text-blue-300",
  work_submitted: "bg-violet-500/10 text-violet-300",
  released: "bg-primary/10 text-primary",
  disputed: "bg-destructive/10 text-destructive",
  cancelled: "bg-white/5 text-muted-foreground",
};

const initialForm = { title: "", counterpartyEmail: "", description: "", amount: "", token: "USDC" as "USDC" | "USDT", deadline: "" };

export default function EscrowDashboard() {
  const { user } = useAuth();
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);

  const loadEscrows = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    if (user.id === "demo-user") {
      const saved = localStorage.getItem("nexol_demo_escrows");
      setEscrows(saved ? JSON.parse(saved) : []);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.from("escrows").select("*").order("created_at", { ascending: false });
    if (error) toast.error("Could not load escrows", { description: error.message });
    setEscrows((data as unknown as Escrow[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadEscrows(); }, [loadEscrows]);

  const activeValue = useMemo(() => escrows.filter((e) => ["funded", "work_submitted"].includes(e.status)).reduce((sum, e) => sum + Number(e.amount), 0), [escrows]);
  const openCount = escrows.filter((e) => !["released", "cancelled"].includes(e.status)).length;

  async function createEscrow(event: React.FormEvent) {
    event.preventDefault();
    if (!user?.email) return;
    if (form.counterpartyEmail.toLowerCase() === user.email.toLowerCase()) {
      toast.error("The counterparty must be someone else.");
      return;
    }
    setSaving(true);
    if (user.id === "demo-user") {
      const demoEscrow: Escrow = {
        id: crypto.randomUUID(),
        creator_id: user.id,
        creator_email: user.email,
        counterparty_email: form.counterpartyEmail.trim().toLowerCase(),
        title: form.title.trim(),
        description: form.description.trim(),
        amount: Number(form.amount),
        token: form.token,
        network: "base",
        deadline: form.deadline ? new Date(`${form.deadline}T23:59:59`).toISOString() : null,
        status: "awaiting_funding",
        funding_tx_hash: null,
        created_at: new Date().toISOString(),
      };
      const updated = [demoEscrow, ...escrows];
      localStorage.setItem("nexol_demo_escrows", JSON.stringify(updated));
      setEscrows(updated);
      setSaving(false);
      setForm(initialForm);
      setOpen(false);
      toast.success("Demo escrow created");
      return;
    }
    const { error } = await supabase.from("escrows").insert({
      creator_id: user.id,
      creator_email: user.email,
      counterparty_email: form.counterpartyEmail.trim().toLowerCase(),
      title: form.title.trim(),
      description: form.description.trim(),
      amount: Number(form.amount),
      token: form.token,
      network: "base",
      deadline: form.deadline ? new Date(`${form.deadline}T23:59:59`).toISOString() : null,
      status: "awaiting_funding",
    });
    setSaving(false);
    if (error) {
      toast.error("Could not create escrow", { description: error.message });
      return;
    }
    toast.success("Escrow agreement created");
    setForm(initialForm);
    setOpen(false);
    loadEscrows();
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Escrow workspace</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-foreground">Your agreements</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create clear terms, secure payment, and release funds when the work is approved.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2 rounded-xl"><Plus size={16} /> New escrow</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={ShieldCheck} label="Active secured value" value={`$${activeValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
        <Metric icon={BriefcaseBusiness} label="Open agreements" value={String(openCount)} />
        <Metric icon={Clock3} label="Awaiting funding" value={String(escrows.filter((e) => e.status === "awaiting_funding").length)} />
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border p-5"><h2 className="font-display text-xl font-semibold">Escrows</h2></div>
        {loading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Loading agreements…</div>
        ) : escrows.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldCheck className="mx-auto mb-4 text-primary" size={42} />
            <h3 className="font-display text-xl font-semibold">No escrows yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Create your first agreement. No funds will be represented as secured until an on-chain funding transaction is confirmed.</p>
            <Button onClick={() => setOpen(true)} className="mt-5 gap-2"><Plus size={15} /> Create escrow</Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {escrows.map((escrow, index) => (
              <motion.div key={escrow.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-semibold text-foreground">{escrow.title}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyle[escrow.status]}`}>{statusLabel[escrow.status]}</span>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">With {escrow.creator_id === user?.id ? escrow.counterparty_email : escrow.creator_email}</p>
                </div>
                <div className="sm:text-right">
                  <p className="font-display text-xl font-bold">{Number(escrow.amount).toLocaleString()} {escrow.token}</p>
                  <p className="text-xs text-muted-foreground">{escrow.deadline ? `Due ${new Date(escrow.deadline).toLocaleDateString()}` : "No deadline"}</p>
                </div>
                <Button variant="ghost" size="icon" disabled title="Agreement actions will unlock after on-chain escrow is configured"><ArrowRight size={16} /></Button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-100/80">
        <AlertTriangle className="mt-0.5 shrink-0 text-amber-300" size={17} />
        <p>Agreement creation is live. Funding and release controls remain disabled until the escrow contract is deployed and verified on Base.</p>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Create an escrow</DialogTitle><DialogDescription>Define the agreement before either party begins work.</DialogDescription></DialogHeader>
          <form onSubmit={createEscrow} className="space-y-4">
            <Field label="Agreement title"><Input required minLength={3} maxLength={120} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Website redesign" /></Field>
            <Field label="Counterparty email"><Input required type="email" value={form.counterpartyEmail} onChange={(e) => setForm({ ...form, counterpartyEmail: e.target.value })} placeholder="client@example.com" /></Field>
            <Field label="Scope and acceptance criteria"><Textarea required minLength={10} maxLength={2000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the deliverables and what counts as accepted…" rows={4} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Amount"><Input required type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="1,000" /></Field>
              <Field label="Currency"><select value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value as "USDC" | "USDT" })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option>USDC</option><option>USDT</option></select></Field>
            </div>
            <Field label="Deadline (optional)"><Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></Field>
            <div className="flex justify-end gap-3 pt-2"><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={saving}>{saving ? "Creating…" : "Create agreement"}</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof ShieldCheck; label: string; value: string }) {
  return <div className="rounded-2xl border border-border bg-card p-5"><div className="flex items-center justify-between"><p className="text-xs text-muted-foreground">{label}</p><Icon size={16} className="text-primary" /></div><p className="mt-2 font-display text-2xl font-bold">{value}</p></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}
