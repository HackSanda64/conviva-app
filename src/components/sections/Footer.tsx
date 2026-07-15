import { Heart, Lock } from 'lucide-react';

interface FooterProps {
  onShowAdmin: () => void;
}

export function Footer({ onShowAdmin }: FooterProps) {
  return (
    <footer className="py-24 text-center px-6 relative z-10">
      <Heart className="mx-auto mb-6 text-[#D4AF37] fill-[#D4AF37]/15" size={36} strokeWidth={1} />
      <p className="text-3xl sm:text-4xl italic font-light mb-12 text-[#5C131D]">"Deus uniu, ninguém separa."</p>
      <div className="font-sans text-[10px] uppercase tracking-[0.5em] text-[#5C131D]/60 font-black">
        Bruno Sandande & Genoveva Alberto
      </div>

      <button
        onClick={onShowAdmin}
        className="mt-20 text-[#5C131D]/40 hover:text-[#5C131D] transition-colors flex items-center gap-2 mx-auto uppercase text-[10px] font-bold tracking-widest bg-white border border-[#E0D8D0]/40 shadow-sm rounded-full py-2 px-6 hover:shadow-md hover:border-[#D4AF37]/30"
      >
        <Lock size={12} /> Painel do Casal
      </button>
    </footer>
  );
}
