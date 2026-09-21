import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowRight, CalendarClock, Check, CheckCircle2, Clock3, Handshake, LockKeyhole, Sparkles, WalletCards } from "lucide-react";
import nexolLogo from "@/assets/nexolpay-logo.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const steps = [
  { number: "01", title: "Set the terms", copy: "Define the deliverable, amount, deadline, and approval conditions in one shared agreement." },
  { number: "02", title: "Fund with intention", copy: "Secure the full amount in escrow or split it into controlled releases that everyone can see." },
  { number: "03", title: "Release on proof", copy: "Approve the work, keep the record, and move money only when the agreed moment arrives." },
];

const stats = [
  { value: "1 shared", label: "source of truth" },
  { value: "2 flows", label: "escrow or schedule" },
  { value: "Base", label: "settlement network" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { enterDemo } = useAuth();

  const openDashboard = () => {
    enterDemo("demo@nexolpay.app");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen overflow-hidden bg-cream font-body text-ink">
      <header className="absolute inset-x-0 top-0 z-50 border-b border-white/10 bg-navy-deep/85 text-cream backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1280px] items-center justify-between px-6 lg:px-12">
          <Link to="/" className="flex items-center gap-2.5"><img src={nexolLogo.src} alt="NexolPay" className="h-9 w-9 rounded-lg" /><span className="font-display text-2xl font-semibold tracking-tight">NexolPay</span></Link>
          <nav className="hidden items-center gap-8 md:flex"><a href="#flows" className="text-sm text-cream/60 transition-colors hover:text-cream">Payment flows</a><a href="#how" className="text-sm text-cream/60 transition-colors hover:text-cream">How it works</a><a href="#network" className="text-sm text-cream/60 transition-colors hover:text-cream">Network</a></nav>
          <div className="flex items-center gap-4"><button type="button" onClick={openDashboard} className="hidden text-sm text-cream/70 transition-colors hover:text-cream sm:block">Sign in</button><button type="button" onClick={openDashboard} className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2.5 text-sm font-bold text-navy-deep transition-transform hover:-translate-y-0.5">Open dashboard <ArrowRight size={15} /></button></div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-navy-deep text-cream">
          <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(hsla(0,0%,100%,.045)_1px,transparent_1px),linear-gradient(90deg,hsla(0,0%,100%,.045)_1px,transparent_1px)] [background-size:64px_64px]" />
          <div className="absolute -right-32 top-20 h-[520px] w-[520px] rounded-full bg-gold/10 blur-3xl" />
          <div className="relative mx-auto grid min-h-[720px] max-w-[1280px] items-center gap-16 px-6 pb-20 pt-36 lg:grid-cols-[0.9fr_1.1fr] lg:px-12 lg:pb-24 lg:pt-40">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <div className="mb-7 inline-flex items-center gap-2 border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-gold"><Sparkles size={14} /> Payment infrastructure for real work</div>
              <h1 className="max-w-2xl font-display text-5xl font-medium leading-[0.98] tracking-tight md:text-7xl">Make every payment<br /><span className="text-gold">mean something.</span></h1>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-cream/65">NexolPay turns a handshake into a clear financial agreement. Secure deliverables in escrow or release stablecoins on a schedule everyone can follow.</p>
              <div className="mt-9 flex flex-wrap items-center gap-4"><button type="button" onClick={openDashboard} className="group inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3.5 font-bold text-navy-deep transition-transform hover:-translate-y-0.5">Open the workspace <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></button><a href="#how" className="inline-flex items-center gap-2 px-2 py-3.5 font-semibold text-cream/70 transition-colors hover:text-cream">See how it works <ArrowDownRight size={17} /></a></div>
              <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-xs font-medium text-cream/45"><span className="flex items-center gap-2"><Check size={14} className="text-gold" /> Shared terms</span><span className="flex items-center gap-2"><Check size={14} className="text-gold" /> On-chain settlement</span><span className="flex items-center gap-2"><Check size={14} className="text-gold" /> No account gate</span></div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.65, delay: 0.15 }} className="relative mx-auto w-full max-w-[570px]">
              <div className="relative border border-white/15 bg-white/[0.07] p-3 shadow-2xl shadow-black/30 backdrop-blur-sm sm:p-5">
                <div className="border border-white/10 bg-[#101b30] p-5 sm:p-7"><div className="flex items-start justify-between border-b border-white/10 pb-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center bg-gold text-navy-deep"><WalletCards size={20} /></div><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cream/40">Payment workspace</p><h2 className="mt-1 font-display text-2xl">Friday releases</h2></div></div><span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-300" /> Live</span></div>
                  <div className="grid gap-5 py-7 sm:grid-cols-[1fr_auto] sm:items-end"><div><p className="text-xs text-cream/45">Total secured</p><p className="mt-2 font-display text-5xl tracking-tight">4,500 <span className="text-xl text-cream/45">USDC</span></p><div className="mt-5 h-2 overflow-hidden bg-white/10"><div className="h-full w-2/3 bg-gold" /></div><div className="mt-2 flex justify-between text-[11px] text-cream/40"><span>2 of 3 milestones</span><span>Due Sep 30</span></div></div><div className="border-l border-white/10 pl-5 text-right"><p className="text-xs text-cream/40">Next release</p><p className="mt-2 font-display text-3xl text-gold">1,500</p><p className="text-xs text-cream/40">after approval</p></div></div>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5"><div className="flex items-center gap-2 text-xs text-cream/55"><LockKeyhole size={15} className="text-gold" /> Funds held by contract</div><span className="border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">On track</span></div>
                </div>
              </div>
              <div className="absolute -bottom-7 -left-5 border border-navy-deep/10 bg-cream px-4 py-3 text-ink shadow-xl sm:-left-8"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center bg-gold/30"><CalendarClock size={18} /></div><div><p className="text-[10px] font-bold uppercase tracking-wider text-ink/40">Scheduled</p><p className="text-sm font-semibold">Every Friday</p></div></div></div>
            </motion.div>
          </div>
        </section>

        <section id="network" className="border-b border-ink/10 bg-cream px-6 py-8 lg:px-12"><div className="mx-auto grid max-w-[1280px] gap-6 sm:grid-cols-3">{stats.map((stat) => <div key={stat.label} className="flex items-baseline gap-3 border-l-2 border-gold pl-4"><p className="font-display text-2xl font-semibold">{stat.value}</p><p className="text-xs font-medium uppercase tracking-[0.12em] text-ink/45">{stat.label}</p></div>)}</div></section>

        <section id="flows" className="bg-cream px-6 py-24 lg:px-12 lg:py-32"><div className="mx-auto max-w-[1280px]"><div className="mb-14 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-deep">Two ways to move money</p><h2 className="mt-4 max-w-2xl font-display text-4xl font-medium leading-tight md:text-6xl">The agreement is the product.</h2></div><p className="max-w-sm text-sm leading-relaxed text-ink/55">When the terms are visible, payment stops being a source of tension and becomes a shared operating system.</p></div>
          <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]"><article id="escrow" className="group border border-ink/10 bg-white p-7 transition-shadow hover:shadow-xl hover:shadow-navy-deep/10 md:p-10"><div className="flex items-start justify-between"><div className="flex h-12 w-12 items-center justify-center bg-gold/30"><Handshake size={23} /></div><span className="font-mono text-xs text-ink/35">01 / ESCROW</span></div><h3 className="mt-12 font-display text-4xl font-medium">Protect the deliverable.</h3><p className="mt-4 max-w-xl leading-relaxed text-ink/60">Set the scope, secure the agreed amount, and release it only after the work is accepted. Both parties see the same terms and status.</p><div className="mt-10 border-t border-ink/10 pt-5"><div className="flex items-center justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-wider text-ink/40">Brand identity package</p><p className="mt-1 font-semibold">Awaiting client approval</p></div><p className="font-display text-3xl">$1,800</p></div><div className="mt-5 flex items-center gap-2 text-xs font-semibold text-emerald-700"><CheckCircle2 size={15} /> Funds secured in escrow</div></div><Link to="/dashboard/escrows" className="mt-9 inline-flex items-center gap-2 font-semibold transition-colors group-hover:text-gold-deep">Create an escrow <ArrowRight size={16} /></Link></article>
            <article id="scheduler" className="group bg-navy-deep p-7 text-cream md:p-10"><div className="flex items-start justify-between"><div className="flex h-12 w-12 items-center justify-center bg-gold/15 text-gold"><CalendarClock size={23} /></div><span className="font-mono text-xs text-cream/35">02 / SCHEDULE</span></div><h3 className="mt-12 font-display text-4xl font-medium">Make time predictable.</h3><p className="mt-4 leading-relaxed text-cream/60">Turn a lump sum into releases your team can plan around. Choose the amount, interval, and duration, then track each payment.</p><div className="mt-10 border-t border-cream/10 pt-5"><div className="flex items-center justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-wider text-cream/40">Weekly release</p><p className="mt-1 font-semibold">4 payments remaining</p></div><p className="font-display text-3xl text-gold">$250</p></div><div className="mt-5 flex items-center gap-2 text-xs text-cream/55"><Clock3 size={15} /> Next release in 3 days</div></div><Link to="/dashboard/scheduler" className="mt-9 inline-flex items-center gap-2 font-semibold text-gold transition-colors group-hover:text-cream">Create a schedule <ArrowRight size={16} /></Link></article></div>
        </div></section>

        <section id="how" className="bg-navy px-6 py-24 text-cream lg:px-12 lg:py-32"><div className="mx-auto grid max-w-[1280px] gap-14 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">A calmer way to work</p><h2 className="mt-5 font-display text-4xl font-medium leading-tight md:text-6xl">Clear before the work starts.</h2><p className="mt-6 max-w-md leading-relaxed text-cream/55">NexolPay gives both sides a shared record of what was agreed, what is funded, and what happens next.</p></div><div className="border-t border-cream/15">{steps.map((step) => <div key={step.number} className="grid gap-4 border-b border-cream/15 py-7 sm:grid-cols-[70px_1fr]"><span className="font-mono text-sm text-gold">{step.number}</span><div><h3 className="font-display text-2xl">{step.title}</h3><p className="mt-2 max-w-lg text-sm leading-relaxed text-cream/55">{step.copy}</p></div></div>)}</div></div></section>

        <section className="bg-cream px-6 py-24 lg:px-12 lg:py-32"><div className="mx-auto grid max-w-[1280px] items-end gap-10 border-b border-ink/10 pb-16 md:grid-cols-[1fr_auto]"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-deep">Ready when you are</p><h2 className="mt-5 max-w-2xl font-display text-5xl font-medium leading-[0.95] md:text-7xl">Put certainty<br />in the contract.</h2></div><div><p className="mb-6 max-w-xs text-sm leading-relaxed text-ink/55">Open the workspace, connect a wallet, and turn your next payment into a process both sides can trust.</p><button type="button" onClick={openDashboard} className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 font-bold text-cream transition-transform hover:-translate-y-0.5">Open NexolPay <ArrowRight size={17} /></button></div></div></section>
      </main>

      <footer className="bg-navy-deep px-6 py-10 text-cream lg:px-12"><div className="mx-auto flex max-w-[1280px] flex-col items-start justify-between gap-6 border-t border-cream/10 pt-8 md:flex-row md:items-center"><div className="flex items-center gap-2"><img src={nexolLogo.src} alt="NexolPay" className="h-8 w-8 rounded-lg" /><span className="font-display text-xl font-semibold">NexolPay</span></div><div className="flex flex-col gap-2 text-xs text-cream/45 md:items-end"><p>Escrow and scheduled payments on Base.</p><p>© {new Date().getFullYear()} NexolPay</p></div></div></footer>
    </div>
  );
}
