import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUp, Container, LogIn, Menu, UserPlus, X } from "lucide-react";

/** Deep-navy top bar: brand far left, actions right. Frosts once scrolled. */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const toAbout = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpen(false);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-blue-500/20 bg-[#07152b]/85 backdrop-blur-xl shadow-[0_10px_40px_-20px_rgba(0,0,0,.9)]"
          : "border-b border-transparent bg-gradient-to-b from-[#0a192f]/90 to-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:h-[68px] sm:px-8">
        {/* brand — far left */}
        <button onClick={toTop} className="group flex items-center gap-2.5" aria-label="VORTEX home">
          <span className="relative grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-600 shadow-[0_6px_18px_-6px_rgba(234,179,8,.8)]">
            <Container size={18} className="text-[#0a192f]" strokeWidth={2.4} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-extrabold tracking-[0.16em] text-white transition-colors group-hover:text-amber-300">
              VORTEX
            </span>
            <span className="mt-0.5 font-mono text-[8px] tracking-[0.22em] text-blue-300/60">
              EAST COAST FREIGHT OS
            </span>
          </span>
        </button>

        {/* desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          <button onClick={toTop} className="btn-ghost !px-4 !py-2 text-sm">
            <ArrowUp size={15} /> Scroll to Top
          </button>
          <button onClick={toAbout} className="btn-ghost !px-4 !py-2 text-sm">
            About
          </button>
          <Link to="/login" className="btn-ghost !px-4 !py-2 text-sm">
            <LogIn size={15} /> Login
          </Link>
          <Link to="/register" className="btn-gold !px-5 !py-2 text-sm">
            <UserPlus size={15} /> Register
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-lg border border-blue-500/25 text-blue-100 md:hidden"
          aria-label="Toggle navigation"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {/* mobile sheet */}
      {open && (
        <div className="border-t border-blue-500/20 bg-[#07152b]/95 px-5 py-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-2">
            <button onClick={() => { toTop(); setOpen(false); }} className="btn-ghost justify-center">
              <ArrowUp size={15} /> Scroll to Top
            </button>
            <button onClick={toAbout} className="btn-ghost justify-center">About</button>
            <button onClick={() => navigate("/login")} className="btn-ghost justify-center">
              <LogIn size={15} /> Login
            </button>
            <button onClick={() => navigate("/register")} className="btn-gold justify-center">
              <UserPlus size={15} /> Register
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
