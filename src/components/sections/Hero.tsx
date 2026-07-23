import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Clock, Heart } from 'lucide-react';
import { ElegantImage } from '../ui/ElegantImage';
import { useCountdown } from '../../hooks/useCountdown';

interface HeroProps {
  weddingDate: Date;
  groomName?: string;
  brideName?: string;
  subTitle?: string;
}

export function Hero({
  weddingDate,
  groomName = "Bruno Sandande",
  brideName = "Genoveva Alberto",
  subTitle = "07 de Agosto de 2026"
}: HeroProps) {
  const countdown = useCountdown(weddingDate);

  const countdownItems = [
    { val: String(countdown.days).padStart(2, '0'), label: 'Dias' },
    { val: String(countdown.hours).padStart(2, '0'), label: 'Horas' },
    { val: String(countdown.minutes).padStart(2, '0'), label: 'Minutos' },
    { val: String(countdown.seconds).padStart(2, '0'), label: 'Segundos' }
  ];

  const handleScrollToItinerary = () => {
    document.getElementById('roteiro')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen py-16 flex items-center justify-center text-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <ElegantImage
          src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2000"
          alt="Bruno e Genoveva"
          className="w-full h-full"
          classNameImg="opacity-55 scale-105 animate-pulse-slow object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDF9]/20 via-[#FFFDF9]/60 to-[#FFFDF9]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 px-4 max-w-4xl mx-auto w-full pt-8 pb-12"
      >
        <motion.span
          initial={{ opacity: 0, letterSpacing: "0.2em" }}
          animate={{ opacity: 1, letterSpacing: "0.5em" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="uppercase text-[11px] md:text-sm mb-6 block font-sans font-black text-[#D4AF37] tracking-[0.5em] drop-shadow-sm"
        >
          Save the Date
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-8xl mb-6 font-light italic leading-tight text-[#5C131D] drop-shadow-sm px-2"
        >
          {groomName} <span className="block md:inline font-sans text-2xl md:text-6xl not-italic text-[#D4AF37] opacity-90 mx-3">&</span> {brideName}
        </motion.h1>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 80 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="h-[2px] bg-[#D4AF37] mx-auto mb-6"
        />

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6 }}
          className="text-lg sm:text-xl md:text-3xl font-light tracking-widest mb-10 text-[#5C131D]/95 font-semibold"
        >
          {subTitle}
        </motion.p>

        {/* Bloco de Contagem Regressiva Organizado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="p-5 sm:p-7 md:p-8 rounded-3xl bg-[#FFFDF9]/80 backdrop-blur-md border border-[#D4AF37]/40 shadow-2xl shadow-[#5C131D]/10 max-w-xl mx-auto"
        >
          <div className="flex items-center justify-center gap-2 mb-4 text-[#5C131D]">
            <Clock size={15} className="text-[#D4AF37]" />
            <span className="text-[10px] sm:text-xs uppercase font-black tracking-[0.25em] text-[#5C131D]/80">
              Contagem Regressiva
            </span>
            <Heart size={12} className="text-[#D4AF37] fill-[#D4AF37]" />
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-4 font-sans">
            {countdownItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.9 + i * 0.1 }}
                className="flex flex-col items-center justify-center bg-[#5C131D] border border-[#D4AF37]/40 rounded-2xl py-3 px-1 sm:py-4 sm:px-2 shadow-md shadow-[#5C131D]/20 group hover:border-[#D4AF37] transition-all"
              >
                <div className="h-8 sm:h-12 flex items-center justify-center overflow-hidden">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={item.val}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      className="text-xl sm:text-3xl md:text-4xl font-mono font-bold text-white group-hover:text-[#D4AF37] transition-colors tracking-tight"
                    >
                      {item.val}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <span className="text-[8px] sm:text-[10px] uppercase tracking-wider text-[#D4AF37] font-black mt-1 block">
                  {item.label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-60 text-[#5C131D] cursor-pointer z-10"
        onClick={handleScrollToItinerary}
      >
        <ChevronDown size={32} strokeWidth={2} />
      </motion.div>
    </section>
  );
}

