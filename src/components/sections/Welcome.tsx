import { motion } from 'motion/react';
import { Heart } from 'lucide-react';

export function Welcome() {
  return (
    <section className="py-24 px-6 bg-[#FAF6F0] relative overflow-hidden text-center border-b border-[#E0D8D0]/30">
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#5C131D_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-[#D4AF37] font-black block">O Convite</span>
          <h2 className="text-3xl sm:text-5xl italic font-light text-[#5C131D]">Queridos Amigos e Familiares</h2>
          <p className="text-base sm:text-lg italic text-[#5C131D]/85 leading-relaxed font-serif max-w-2xl mx-auto pt-4">
            "Com a bênção de Deus e o carinho das nossas famílias, temos a imensa alegria de convidar-vos para celebrar connosco o dia em que uniremos as nossas vidas. A vossa presença é o maior presente e completará a nossa felicidade nesta linda celebração de amor."
          </p>
          <div className="pt-6 flex justify-center items-center gap-2 text-[#D4AF37]">
            <div className="h-[1px] w-12 bg-[#D4AF37]/50" />
            <Heart size={16} className="fill-[#D4AF37]/20 animate-pulse-slow" />
            <div className="h-[1px] w-12 bg-[#D4AF37]/50" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
