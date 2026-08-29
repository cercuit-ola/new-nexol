import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import nexolLogo from "@/assets/nexolpay-logo.png";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const links = [
    { label: "Features", href: "#features" },
    { label: "Dashboard", href: "/dashboard", isRoute: true },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 glass-nav rounded-full px-4 sm:px-6 py-3 flex items-center justify-between w-[95%] sm:w-[90%] max-w-3xl"
    >
      <a href="#" className="flex items-center gap-2 font-display font-extrabold text-lg text-foreground">
        <img src={nexolLogo.src} alt="NexolPay" className="w-8 h-8 rounded-lg" />
        NexolPay
      </a>

      <div className="hidden md:flex items-center gap-6">
        {links.map((l) =>
          l.isRoute ? (
            <Link key={l.href} to={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </Link>
          ) : (
            <a key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </a>
          )
        )}
      </div>

      <div className="hidden md:block">
        <Link to="/dashboard" className="bg-[#22C55E] text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-[#16a34a] transition-colors shadow-lg shadow-[#22C55E]/25">
          Try Now
        </Link>
      </div>

      <button className="md:hidden ml-auto text-foreground" onClick={() => setOpen(!open)}>
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 glass-nav rounded-2xl p-4 flex flex-col gap-3 md:hidden"
        >
          {links.map((l) =>
            l.isRoute ? (
              <Link key={l.href} to={l.href} onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
                {l.label}
              </Link>
            ) : (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
                {l.label}
              </a>
            )
          )}
          <Link to="/dashboard" onClick={() => setOpen(false)} className="bg-[#22C55E] text-white text-sm font-semibold px-5 py-2.5 rounded-full text-center hover:bg-[#16a34a] transition-colors">
            Try Now
          </Link>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
