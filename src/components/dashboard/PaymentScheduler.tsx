import { useCallback, useEffect, useState } from "react";
import { CalendarClock, Clock3, Plus, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Schedule {
  id: string;
  name: string;
  recipient_email: string | null;
  total_amount: number;
  installment_amount: number;
  installment_count: number;
  interval_days: number;
  token: "USDC" | "USDT";
  starts_at: string;
  next_release_at: string;
  released_count: number;
  status: "scheduled" | "active" | "completed" | "cancelled";
}

const initialForm = { name: "", recipientEmail: "", total: "", count: "4", intervalDays: "7", token: "USDC" as "USDC" | "USDT", startDate: "" };

export default function PaymentScheduler() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from("payment_schedules").select("*").order("created_at", { ascending: false });
    if (error) toast.error("Could not load schedules", { description: error.message });
    setSchedules((data as Schedule[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function createSchedule(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;
    const total = Number(form.total);
    const count = Number(form.count);
    const startsAt = new Date(`${form.startDate}T09:00:00`);
    setSaving(true);
    const { error } = await supabase.from("payment_schedules").insert({
      user_id: user.id,
      name: form.name.trim(),
      recipient_email: form.recipientEmail.trim().toLowerCase() || null,
      total_amount: total,
      installment_amount: total / count,
      installment_count: count,
      interval_days: Number(form.intervalDays),
      token: form.token,
      starts_at: startsAt.toISOString(),
      next_release_at: startsAt.toISOString(),
      status: "scheduled",
    });
    setSaving(false);
    if (error) return toast.error("Could not create schedule", { description: error.message });
    toast.success("Payment schedule created");
    setForm(initialForm);
    setOpen(false);
    load();
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Payment scheduler</p><h1 className="mt-2 font-display text-3xl font-bold">Scheduled payouts</h1><p className="mt-1 text-sm text-muted-foreground">Plan predictable releases from a single total amount.</p></div>
        <Button onClick={() => setOpen(true)} className="gap-2 rounded-xl"><Plus size={16} /> New schedule</Button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border p-5"><h2 className="font-display text-xl font-semibold">Schedules</h2></div>
        {loading ? <div className="p-12 text-center text-sm text-muted-foreground">Loading schedules…</div> : schedules.length === 0 ? (
          <div className="p-12 text-center"><CalendarClock className="mx-auto mb-4 text-primary" size={42} /><h3 className="font-display text-xl font-semibold">No payment schedules</h3><p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Set an amount and cadence to create your first payout plan.</p><Button onClick={() => setOpen(true)} className="mt-5 gap-2"><Plus size={15} /> Create schedule</Button></div>
        ) : <div className="divide-y divide-border">{schedules.map((schedule) => {
          const progress = (schedule.released_count / schedule.installment_count) * 100;
          return <div key={schedule.id} className="p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h3 className="truncate font-semibold">{schedule.name}</h3><span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold capitalize text-amber-300">{schedule.status}</span></div><p className="mt-1 text-xs text-muted-foreground">{schedule.recipient_email || "Self-directed schedule"}</p></div><div className="sm:text-right"><p className="font-display text-xl font-bold">{Number(schedule.installment_amount).toLocaleString(undefined, { maximumFractionDigits: 2 })} {schedule.token}</p><p className="flex items-center gap-1 text-xs text-muted-foreground sm:justify-end"><Clock3 size={12} /> Every {schedule.interval_days} days</p></div></div><div className="mt-4 h-1.5 rounded-full bg-accent"><div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} /></div><div className="mt-2 flex justify-between text-[11px] text-muted-foreground"><span>{schedule.released_count} of {schedule.installment_count} released</span><span>Starts {new Date(schedule.starts_at).toLocaleDateString()}</span></div></div>;
        })}</div>}
      </div>

      <div className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-100/80"><ShieldAlert size={17} className="mt-0.5 shrink-0 text-amber-300" /><p>Schedule planning is live. Automatic releases remain disabled until the scheduler contract is deployed and funded.</p></div>

      <Dialog open={open} onOpenChange={setOpen}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Create a payment schedule</DialogTitle><DialogDescription>Split a total amount into equal, recurring releases.</DialogDescription></DialogHeader><form onSubmit={createSchedule} className="space-y-4">
        <Field label="Schedule name"><Input required minLength={3} maxLength={120} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Monthly contractor payment" /></Field>
        <Field label="Recipient email (optional)"><Input type="email" value={form.recipientEmail} onChange={(e) => setForm({ ...form, recipientEmail: e.target.value })} placeholder="recipient@example.com" /></Field>
        <div className="grid grid-cols-2 gap-4"><Field label="Total amount"><Input required type="number" min="0.01" step="0.01" value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })} /></Field><Field label="Currency"><select value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value as "USDC" | "USDT" })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option>USDC</option><option>USDT</option></select></Field></div>
        <div className="grid grid-cols-2 gap-4"><Field label="Number of payments"><Input required type="number" min="2" max="52" value={form.count} onChange={(e) => setForm({ ...form, count: e.target.value })} /></Field><Field label="Days between payments"><Input required type="number" min="1" max="365" value={form.intervalDays} onChange={(e) => setForm({ ...form, intervalDays: e.target.value })} /></Field></div>
        <Field label="Start date"><Input required type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Field>
        {Number(form.total) > 0 && Number(form.count) > 0 && <div className="rounded-xl bg-accent/60 p-4 text-sm text-muted-foreground">Each release: <strong className="text-foreground">{(Number(form.total) / Number(form.count)).toFixed(2)} {form.token}</strong></div>}
        <div className="flex justify-end gap-3 pt-2"><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={saving}>{saving ? "Creating…" : "Create schedule"}</Button></div>
      </form></DialogContent></Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-2"><Label>{label}</Label>{children}</div>; }
