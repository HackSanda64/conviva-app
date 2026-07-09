import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
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
    { val: countdown.days, label: 'Dias' },
    { val: countdown.hours, label: 'Horas' },
    { val: countdown.minutes, label: 'Min' },
    { val: countdown.seconds, label: 'Seg' }
  ];

  const handleScrollToItinerary = () => {
    document.getElementById('roteiro')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
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
        className="relative z-10 px-4 max-w-4xl mx-auto w-full"
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
          className="text-4xl sm:text-5xl md:text-8xl mb-8 font-light italic leading-tight text-[#5C131D] drop-shadow-sm px-2"
        >
          {groomName} <span className="block md:inline font-sans text-2xl md:text-6xl not-italic text-[#D4AF37] opacity-90 mx-3">&</span> {brideName}
        </motion.h1>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 80 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="h-[2px] bg-[#D4AF37] mx-auto mb-8"
        />

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6 }}
          className="text-lg sm:text-xl md:text-3xl font-light tracking-widest mb-12 text-[#5C131D]/95 font-semibold"
        >
          {subTitle}
        </motion.p>

        <div className="grid grid-cols-4 gap-2 sm:gap-4 md:flex md:gap-6 justify-center font-sans max-w-sm sm:max-w-md md:max-w-xl mx-auto w-full px-2">
          {countdownItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-center bg-[#5C131D]/90 backdrop-blur-md border border-[#D4AF37]/30 rounded-2xl p-2.5 sm:p-4 md:p-6 md:min-w-[110px] group transition-all hover:border-[#D4AF37]/60 shadow-xl shadow-black/20"
            >
              <div className="h-8 sm:h-10 md:h-14 overflow-hidden relative flex items-center justify-center">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={item.val}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className="text-xl sm:text-2xl md:text-5xl font-light block text-white group-hover:text-[#D4AF37] transition-colors"
                  >
                    {item.val}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-black mt-1 sm:mt-2 block">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-60 text-[#5C131D] cursor-pointer z-10"
        onClick={handleScrollToItinerary}
      >
        <ChevronDown size={32} strokeWidth={2} />
      </motion.div>
    </section>
  );
}
