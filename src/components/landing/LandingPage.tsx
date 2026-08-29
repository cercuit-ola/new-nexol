import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CalendarClock, Check, CheckCircle2, Clock3, Handshake, LockKeyhole, ShieldCheck } from "lucide-react";
import nexolLogo from "@/assets/nexolpay-logo.png";

const steps = [
  { number: "01", title: "Agree on the terms", copy: "Define the job, payment amount, deadline, and acceptance criteria before work begins." },
  { number: "02", title: "Secure or schedule funds", copy: "Lock payment in escrow or divide a lump sum into predictable scheduled releases." },
  { number: "03", title: "Release with confidence", copy: "Approve completed work and release payment with a clear record for both parties." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-mesh font-body text-ink">
      <header className="sticky top-0 z-50 border-b border-ink/5 bg-cream/75 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-6 lg:px-12">
          <Link to="/" className="flex items-center gap-2.5"><img src={nexolLogo.src} alt="NexolPay" className="h-9 w-9 rounded-lg" /><span className="font-display text-2xl font-semibold tracking-tight">NexolPay</span></Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#escrow" className="text-sm text-ink/65 hover:text-ink">Escrow</a><a href="#scheduler" className="text-sm text-ink/65 hover:text-ink">Payment scheduler</a><a href="#how" className="text-sm text-ink/65 hover:text-ink">How it works</a>
          </nav>
          <div className="flex items-center gap-3"><Link to="/auth" className="hidden text-sm text-ink/70 hover:text-ink sm:block">Sign in</Link><Link to="/auth?mode=signup" className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream hover:bg-ink/90">Sign up</Link></div>
        </div>
      </header>

      <main>
        <section className="overflow-hidden">
          <div className="mx-auto grid max-w-[1280px] items-center gap-14 px-6 pb-24 pt-16 lg:grid-cols-2 lg:px-12 lg:py-28">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full bg-gold/25 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em]"><ShieldCheck size={14} /> Payment certainty for modern work</div>
              <h1 className="font-display text-5xl font-semibold leading-[1.03] tracking-tight md:text-6xl lg:text-7xl">Secure the deal.<br /><span className="relative"><span className="relative z-10">Control the payout.</span><span className="absolute inset-x-0 bottom-1 h-3 bg-gold/65" /></span></h1>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink/65">NexolPay protects payments between clients and professionals. Hold funds in escrow for completed work, or schedule controlled releases over time.</p>
              <div className="mt-9 flex flex-wrap gap-4">
                <Link to="/auth?mode=signup" className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-4 font-semibold text-cream shadow-lg shadow-ink/10">Create free account <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></Link>
                <Link to="/dashboard/scheduler" className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/60 px-7 py-4 font-semibold backdrop-blur hover:bg-white">Schedule a payment</Link>
              </div>
              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-ink/55"><span className="flex items-center gap-1.5"><Check size={14} /> Clear terms</span><span className="flex items-center gap-1.5"><Check size={14} /> Transparent status</span><span className="flex items-center gap-1.5"><Check size={14} /> Base settlement</span></div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.65, delay: 0.15 }} className="relative mx-auto w-full max-w-lg">
              <div className="premium-shadow rounded-3xl bg-navy-deep p-7 text-cream">
                <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cream/45">Active escrow</p><h3 className="mt-2 font-display text-2xl font-semibold">Product website</h3></div><span className="rounded-full bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">Funded</span></div>
                <div className="my-7 rounded-2xl border border-cream/10 bg-cream/5 p-6"><p className="text-xs text-cream/50">Secured amount</p><p className="mt-1 font-display text-4xl font-semibold">4,500 USDC</p><div className="mt-6 h-1.5 overflow-hidden rounded-full bg-cream/10"><div className="h-full w-2/3 rounded-full bg-gold" /></div><div className="mt-3 flex justify-between text-[11px] text-cream/45"><span>Work in progress</span><span>Due Sep 30</span></div></div>
                <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-sm text-cream/65"><LockKeyhole size={16} className="text-gold" /> Funds secured</div><button className="rounded-full bg-gold px-4 py-2 text-xs font-bold text-navy-deep">Release when approved</button></div>
              </div>
              <div className="floating absolute -bottom-7 -left-7 rounded-2xl bg-white p-4 shadow-xl"><CalendarClock className="text-navy-deep" size={28} /></div>
            </motion.div>
          </div>
        </section>

        <section className="bg-navy-deep px-6 py-20 text-center text-cream lg:px-12"><p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">One focused platform</p><h2 className="mx-auto mt-5 max-w-3xl font-display text-3xl font-medium leading-tight md:text-5xl">Protection when payment depends on delivery. Control when payment depends on time.</h2></section>

        <section className="bg-cream px-6 py-24 lg:px-12">
          <div className="mx-auto max-w-[1280px]">
            <div className="mb-14 max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/45">Two ways to pay safely</p><h2 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">Built for agreements, not guesswork.</h2></div>
            <div className="grid gap-6 lg:grid-cols-2">
              <article id="escrow" className="architect-grid-item rounded-3xl border border-ink/5 bg-white p-8 md:p-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/30"><Handshake size={23} /></div><h3 className="mt-7 font-display text-3xl font-semibold">Escrow payments</h3><p className="mt-4 leading-relaxed text-ink/60">Set the scope, secure the agreed amount, and release it only after the work is accepted. Both parties see the same terms and status.</p>
                <div className="mt-8 rounded-2xl bg-cream p-5"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-wider text-ink/40">Design contract</p><p className="mt-1 font-semibold">Brand identity package</p></div><p className="font-display text-2xl font-semibold">$1,800</p></div><div className="mt-5 flex items-center gap-2 text-xs font-semibold text-emerald-700"><CheckCircle2 size={15} /> Awaiting client approval</div></div>
                <Link to="/dashboard/escrows" className="mt-8 inline-flex items-center gap-2 font-semibold">Create an escrow <ArrowRight size={16} /></Link>
              </article>
              <article id="scheduler" className="architect-grid-item rounded-3xl bg-navy-deep p-8 text-cream md:p-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold"><CalendarClock size={23} /></div><h3 className="mt-7 font-display text-3xl font-semibold">Payment scheduler</h3><p className="mt-4 leading-relaxed text-cream/60">Turn a lump sum into predictable releases. Choose the amount, interval, and duration, then track every scheduled payment.</p>
                <div className="mt-8 rounded-2xl border border-cream/10 bg-cream/5 p-5"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-wider text-cream/40">Weekly release</p><p className="mt-1 font-semibold">4 payments remaining</p></div><p className="font-display text-2xl font-semibold text-gold">$250</p></div><div className="mt-5 flex items-center gap-2 text-xs text-cream/55"><Clock3 size={15} /> Next release in 3 days</div></div>
                <Link to="/dashboard/scheduler" className="mt-8 inline-flex items-center gap-2 font-semibold text-gold">Create a schedule <ArrowRight size={16} /></Link>
              </article>
            </div>
          </div>
        </section>

        <section id="how" className="bg-cream px-6 pb-24 lg:px-12"><div className="mx-auto max-w-[1280px] rounded-3xl border border-ink/5 bg-white p-8 md:p-12"><div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/45">How it works</p><h2 className="mt-4 font-display text-4xl font-semibold">A clear path from agreement to payment.</h2></div><div className="space-y-7">{steps.map((step) => <div key={step.number} className="flex gap-5"><span className="font-mono text-xs font-bold text-gold-deep">{step.number}</span><div><h3 className="font-semibold">{step.title}</h3><p className="mt-1 text-sm leading-relaxed text-ink/55">{step.copy}</p></div></div>)}</div></div></div></section>

        <section className="bg-cream px-6 pb-20 lg:px-12"><div className="mx-auto max-w-[1280px] overflow-hidden rounded-3xl bg-navy-deep px-8 py-16 text-center text-cream"><h2 className="font-display text-4xl font-semibold md:text-5xl">Make the payment terms certain.</h2><p className="mx-auto mt-4 max-w-xl text-cream/60">Create an escrow for deliverable-based work or schedule controlled payments over time.</p><Link to="/auth?mode=signup" className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold px-8 py-4 font-semibold text-navy-deep">Sign up for NexolPay <ArrowRight size={17} /></Link></div></section>
      </main>

      <footer className="bg-navy-deep px-6 py-10 text-cream lg:px-12"><div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-5 border-t border-cream/10 pt-8 md:flex-row"><div className="flex items-center gap-2"><img src={nexolLogo.src} alt="NexolPay" className="h-8 w-8 rounded-lg" /><span className="font-display text-xl font-semibold">NexolPay</span></div><p className="text-xs text-cream/45">Escrow and scheduled payments on Base.</p><p className="text-xs text-cream/45">© {new Date().getFullYear()} NexolPay</p></div></footer>
    </div>
  );
}
