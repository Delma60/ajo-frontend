import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-sm border-b border-zinc-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm1 8h-2v-5l4 2.5-2 1.15V14z" fill="white" />
              </svg>
            </div>
            <span className="font-bold text-zinc-900 text-xl" style={{ fontFamily: "Georgia, serif" }}>
              AjoSave
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[13.5px] font-medium text-zinc-500">
            <a href="#how" className="hover:text-zinc-900 transition-colors">How it works</a>
            <a href="#trust" className="hover:text-zinc-900 transition-colors">Trust & Safety</a>
            <a href="#faq" className="hover:text-zinc-900 transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[13px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              Sign in
            </Link>
            <Link
              href="/register"
              className="h-9 px-4 rounded-full bg-emerald-800 text-white text-[13px] font-medium flex items-center hover:bg-emerald-700 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(5,150,105,0.08),transparent)]" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full bg-emerald-50/60 blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[12.5px] font-semibold text-emerald-800 uppercase tracking-wide">
                18,000+ members saving together
              </span>
            </div>

            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-zinc-900 leading-[1.08] tracking-tight mb-6"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Save with your circle.{" "}
              <span className="text-emerald-700">Grow together.</span>
            </h1>

            <p className="text-xl text-zinc-500 leading-relaxed max-w-xl mb-10">
              AjoSave brings the trusted tradition of Ajo — rotational savings — into the digital age. Join a circle, contribute monthly, and receive your payout when it's your turn.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/register"
                className="h-12 px-8 rounded-full bg-emerald-800 text-white font-semibold text-[15px] flex items-center justify-center hover:bg-emerald-700 transition-colors"
              >
                Start saving free
              </Link>
              <Link
                href="/groups/discover"
                className="h-12 px-8 rounded-full border border-zinc-200 text-zinc-700 font-semibold text-[15px] flex items-center justify-center hover:border-zinc-300 hover:bg-zinc-50 transition-colors gap-2"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M11 19A8 8 0 1 0 11 3a8 8 0 0 0 0 16z" />
                </svg>
                Explore circles
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-2">
                {["Ng", "Ch", "Ad", "Em", "Fa"].map((init, i) => (
                  <div
                    key={init}
                    className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-[11px] font-bold text-white"
                    style={{ background: ["#064e3b","#065f46","#047857","#059669","#10b981"][i] }}
                  >
                    {init}
                  </div>
                ))}
              </div>
              <div className="text-[13px] text-zinc-500">
                <span className="font-semibold text-zinc-800">₦1.2B+</span> paid out to members this year
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ticker / stats bar ──────────────────────────────────────────── */}
      <div className="bg-emerald-900 py-4 overflow-hidden">
        <div className="flex gap-16 items-center animate-[marquee_25s_linear_infinite] whitespace-nowrap">
          {[
            "₦1.2B+ Paid Out",
            "18,000+ Members",
            "2,400+ Active Circles",
            "100% Transparent",
            "Secure & Trusted",
            "₦1.2B+ Paid Out",
            "18,000+ Members",
            "2,400+ Active Circles",
            "100% Transparent",
            "Secure & Trusted",
          ].map((item, i) => (
            <span key={i} className="text-emerald-300 font-medium text-[13px] uppercase tracking-widest flex items-center gap-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section id="how" className="py-24 px-6 bg-zinc-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-emerald-700 font-semibold text-[12px] uppercase tracking-[0.15em] mb-3">Simple process</p>
            <h2 className="text-4xl font-bold text-zinc-900" style={{ fontFamily: "Georgia, serif" }}>
              How AjoSave works
            </h2>
            <p className="text-zinc-500 mt-4 max-w-lg mx-auto">
              From joining a circle to receiving your payout — it takes just minutes to get started.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: "01",
                icon: (
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                ),
                title: "Join or create a circle",
                desc: "Browse public savings circles or start your own. Invite trusted friends, family, or colleagues.",
              },
              {
                num: "02",
                icon: (
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                ),
                title: "Contribute each cycle",
                desc: "Fund your wallet and contribute automatically or manually each week, bi-week, or month.",
              },
              {
                num: "03",
                icon: (
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                  </svg>
                ),
                title: "Receive your payout",
                desc: "When your turn comes, the full pooled amount lands directly in your wallet — instantly.",
              },
            ].map((step) => (
              <div key={step.num} className="bg-white rounded-2xl border border-zinc-200 p-8 hover:border-emerald-200 transition-colors group">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                    {step.icon}
                  </div>
                  <span className="text-4xl font-bold text-zinc-100 group-hover:text-emerald-100 transition-colors" style={{ fontFamily: "Georgia, serif" }}>
                    {step.num}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2" style={{ fontFamily: "Georgia, serif" }}>
                  {step.title}
                </h3>
                <p className="text-[13.5px] text-zinc-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature showcase ─────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-emerald-700 font-semibold text-[12px] uppercase tracking-[0.15em] mb-4">Payout modes</p>
              <h2 className="text-4xl font-bold text-zinc-900 mb-6" style={{ fontFamily: "Georgia, serif" }}>
                Three ways to determine who gets paid first
              </h2>
              <div className="space-y-5">
                {[
                  { label: "Rotational", desc: "Fixed turn order decided at creation. Everyone knows when they'll receive their payout." },
                  { label: "Random draw", desc: "A fair, transparent draw each cycle. Equal chance for everyone — no favoritism." },
                  { label: "Bid-based", desc: "Members bid for early payout slots by offering a premium to the pool — great for urgent needs." },
                ].map((m) => (
                  <div key={m.label} className="flex gap-4">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900 text-[14px]">{m.label}</p>
                      <p className="text-[13px] text-zinc-500 mt-0.5 leading-relaxed">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini dashboard card */}
            <div className="relative">
              <div className="absolute -inset-4 bg-emerald-50 rounded-3xl" />
              <div className="relative bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-900 to-emerald-700 px-6 py-5">
                  <p className="text-emerald-300/70 text-[11px] font-semibold uppercase tracking-widest mb-1">Lagos Tech Circle</p>
                  <p className="text-white text-2xl font-bold" style={{ fontFamily: "Georgia, serif" }}>₦500k <span className="text-emerald-300/60 text-sm font-normal">pool</span></p>
                  <div className="flex gap-3 mt-3 text-[12px] text-emerald-200/70">
                    <span>10 members</span>
                    <span>•</span>
                    <span>₦50k/month</span>
                    <span>•</span>
                    <span>Rotational</span>
                  </div>
                </div>
                {/* Members */}
                <div className="px-6 py-4 divide-y divide-zinc-50">
                  {[
                    { name: "Emeka Obi", turn: 1, paid: true, active: false },
                    { name: "Adaeze N.", turn: 2, paid: true, active: false },
                    { name: "You", turn: 3, paid: true, active: true },
                    { name: "Chidi Eze", turn: 4, paid: false, active: false },
                    { name: "Fatima B.", turn: 5, paid: true, active: false },
                  ].map((m) => (
                    <div key={m.name} className={`flex items-center gap-3 py-3 ${m.active ? "bg-emerald-50/50 -mx-6 px-6" : ""}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white ${m.active ? "bg-emerald-700 ring-2 ring-emerald-400" : "bg-zinc-400"}`}>
                        {m.name.slice(0, 2).toUpperCase()}
                      </div>
                      <p className="flex-1 text-[13px] font-medium text-zinc-800">{m.name} {m.active && <span className="text-emerald-600 text-[11px] font-bold">(you)</span>}</p>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${m.paid ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        {m.paid ? "Paid" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="px-6 py-3 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-[12px] text-zinc-400">Next payout: Jun 1</span>
                  <span className="text-[12px] font-semibold text-emerald-700">98% trust score</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust & Safety ───────────────────────────────────────────────── */}
      <section id="trust" className="py-24 px-6 bg-zinc-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-emerald-700 font-semibold text-[12px] uppercase tracking-[0.15em] mb-3">Peace of mind</p>
            <h2 className="text-4xl font-bold text-zinc-900" style={{ fontFamily: "Georgia, serif" }}>
              Built on trust, secured by design
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />,
                title: "KYC verified",
                desc: "Every member verifies their identity with BVN and government ID before joining premium circles.",
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />,
                title: "Wallet-backed",
                desc: "Contributions are held in secure wallets. Funds are only released when the cycle completes.",
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />,
                title: "Trust scores",
                desc: "Every circle and member has a live trust score based on payment history and reliability.",
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />,
                title: "Penalty system",
                desc: "Automatic late-payment penalties keep all members accountable without admin intervention.",
              },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl border border-zinc-200 p-6 hover:border-emerald-200 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    {f.icon}
                  </svg>
                </div>
                <h3 className="font-bold text-zinc-900 text-[14px] mb-1.5">{f.title}</h3>
                <p className="text-[12.5px] text-zinc-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-zinc-900 text-center mb-16" style={{ fontFamily: "Georgia, serif" }}>
            Real stories from real savers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "Ajo saved me when the bank wouldn't. I used my payout to expand my tailoring business. AjoSave made it seamless.",
                author: "Ngozi Adeyemi",
                role: "Business owner, Lagos",
                initials: "NA",
              },
              {
                quote: "I used my Ajo payout to start my business. Highly recommended! The transparency is what won me over.",
                author: "Chinedu Okafor",
                role: "Entrepreneur, Abuja",
                initials: "CO",
              },
              {
                quote: "Being an admin is easy — the platform handles reminders, payments, and the trust scores tell you everything.",
                author: "Amaka Okonkwo",
                role: "Circle admin, Port Harcourt",
                initials: "AO",
              },
            ].map((t) => (
              <div key={t.author} className="bg-white rounded-2xl border border-zinc-200 p-7 hover:border-emerald-200 transition-colors flex flex-col gap-5">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="#10b981">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-zinc-600 text-[13.5px] leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[11px] font-bold">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-zinc-900">{t.author}</p>
                    <p className="text-[11px] text-zinc-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 px-6 bg-zinc-50/50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-zinc-900 text-center mb-12" style={{ fontFamily: "Georgia, serif" }}>
            Frequently asked
          </h2>
          <div className="space-y-0 divide-y divide-zinc-200 border border-zinc-200 rounded-2xl overflow-hidden bg-white">
            {[
              {
                q: "Is AjoSave regulated?",
                a: "AjoSave operates under CBN guidelines for digital savings cooperatives. All transactions are tracked, and KYC compliance is mandatory for withdrawals above ₦500k.",
              },
              {
                q: "What happens if someone doesn't pay?",
                a: "Late payments attract an automatic penalty deducted from the defaulter's wallet. Repeated defaults can result in removal from the circle and suspension from the platform.",
              },
              {
                q: "How much does it cost to use AjoSave?",
                a: "Joining circles is free. Circle creators pay a one-time 5% creation fee based on the contribution amount. Withdrawals may carry a small processing fee.",
              },
              {
                q: "Can I leave a circle midway?",
                a: "You can request to leave a circle, but a penalty may apply depending on the circle's rules. Admins can also approve or deny exit requests.",
              },
              {
                q: "How are payouts delivered?",
                a: "Payouts are sent to your AjoSave wallet instantly. From there, you can withdraw to any Nigerian bank account linked to your profile.",
              },
            ].map((faq, i) => (
              <details key={i} className="group px-6 py-5 cursor-pointer [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between text-[14px] font-semibold text-zinc-900 list-none select-none">
                  {faq.q}
                  <svg className="w-4 h-4 text-zinc-400 group-open:rotate-180 transition-transform shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-3 text-[13.5px] text-zinc-500 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="rounded-3xl px-8 py-16 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #064e3b 0%, #065f46 55%, #047857 100%)" }}
          >
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #6ee7b7 0%, transparent 70%)" }} />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
                Ready to start saving?
              </h2>
              <p className="text-emerald-100/80 text-lg mb-10 max-w-lg mx-auto">
                Join thousands of Nigerians who are saving smarter, together. Create or join a circle today.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/register"
                  className="h-12 px-8 rounded-full bg-white text-emerald-900 font-bold text-[15px] flex items-center justify-center hover:bg-emerald-50 transition-colors"
                >
                  Create free account
                </Link>
                <Link
                  href="/groups/discover"
                  className="h-12 px-8 rounded-full bg-white/15 text-white font-semibold text-[15px] flex items-center justify-center hover:bg-white/25 transition-colors"
                >
                  Browse circles
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-100 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-800 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm1 8h-2v-5l4 2.5-2 1.15V14z" fill="white" />
                </svg>
              </div>
              <span className="font-bold text-zinc-900 text-lg" style={{ fontFamily: "Georgia, serif" }}>AjoSave</span>
            </div>
            <p className="text-[12.5px] text-zinc-400 max-w-xs leading-relaxed">
              Bringing the trusted Ajo savings tradition into the digital age. Transparent, trusted, and on time.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-[13px]">
            <div>
              <p className="font-semibold text-zinc-900 mb-3 text-[12px] uppercase tracking-wide">Product</p>
              <div className="space-y-2 text-zinc-500">
                <Link href="/groups/discover" className="block hover:text-zinc-900 transition-colors">Discover circles</Link>
                <Link href="/groups/create" className="block hover:text-zinc-900 transition-colors">Create a circle</Link>
                <Link href="/dashboard" className="block hover:text-zinc-900 transition-colors">Dashboard</Link>
              </div>
            </div>
            <div>
              <p className="font-semibold text-zinc-900 mb-3 text-[12px] uppercase tracking-wide">Company</p>
              <div className="space-y-2 text-zinc-500">
                <a href="#" className="block hover:text-zinc-900 transition-colors">About</a>
                <a href="#" className="block hover:text-zinc-900 transition-colors">Blog</a>
                <a href="/support" className="block hover:text-zinc-900 transition-colors">Support</a>
              </div>
            </div>
            <div>
              <p className="font-semibold text-zinc-900 mb-3 text-[12px] uppercase tracking-wide">Legal</p>
              <div className="space-y-2 text-zinc-500">
                <a href="#" className="block hover:text-zinc-900 transition-colors">Privacy policy</a>
                <a href="#" className="block hover:text-zinc-900 transition-colors">Terms of service</a>
                <a href="#" className="block hover:text-zinc-900 transition-colors">Cookie policy</a>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-zinc-400">© 2026 AjoSave. All rights reserved.</p>
          <p className="text-[12px] text-zinc-400">Made with ❤️ for Nigeria</p>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}