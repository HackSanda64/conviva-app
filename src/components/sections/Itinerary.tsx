import React from 'react';
import { motion } from 'motion/react';
import { Heart, MapPin, Church, PartyPopper, Gavel } from 'lucide-react';

interface ItineraryStep {
  icon: React.ReactNode;
  title: string;
  time: string;
  place: string;
  desc: string;
  link: string;
  qrCode: string;
}

export function Itinerary() {
  const steps: ItineraryStep[] = [
    {
      icon: <Gavel size={26} />,
      title: "Casamento Civil",
      time: "09:00",
      place: "Conservatória do SIAC no Zango 4",
      desc: "O início da nossa caminhada legal, onde assinamos o nosso primeiro 'Sim' oficial perante a lei.",
      link: "https://maps.app.goo.gl/yTfaFM6yrqC7ppVeA",
      qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://maps.app.goo.gl/yTfaFM6yrqC7ppVeA"
    },
    {
      icon: <Church size={26} />,
      title: "Cerimónia Religiosa",
      time: "16:00",
      place: "Camama, Bairro Simione",
      desc: "Rua Mufulama. A nossa bênção diante de Deus para selar os nossos votos de amor eterno. Venha testemunhar este momento sagrado!",
      link: "https://maps.app.goo.gl/CoPx9C6TdSLbfnjZ9",
      qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://maps.app.goo.gl/CoPx9C6TdSLbfnjZ9"
    },
    {
      icon: <PartyPopper size={26} />,
      title: "Copo de Água & Festa",
      time: "21:00",
      place: "Jango do Kikuxi",
      desc: "Momento de celebrar a nossa união com um jantar especial, brindes, risadas e muita dança. Junte-se à festa!",
      link: "https://maps.app.goo.gl/iPhHzKyhUYZNiM5MA",
      qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://maps.app.goo.gl/iPhHzKyhUYZNiM5MA"
    }
  ];

  return (
    <section id="roteiro" className="py-32 px-4 max-w-6xl mx-auto relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-20"
      >
        <Heart className="mx-auto mb-6 text-[#D4AF37] fill-[#D4AF37]/10" size={48} strokeWidth={1} />
        <h2 className="text-4xl md:text-6xl italic font-light mb-4 text-[#5C131D]">O Nosso Roteiro</h2>
        <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#5C131D]/60 font-black">O caminho para o nosso 'Sim'</p>
      </motion.div>

      <div className="relative space-y-8 md:space-y-0 md:flex md:justify-between items-stretch gap-6 lg:gap-8">
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent -translate-y-1/2 z-0" />

        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 1, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -8, scale: 1.01 }}
            className="relative z-10 text-center flex-1 px-5 py-8 sm:px-6 sm:py-10 rounded-3xl bg-white border border-[#E0D8D0]/40 shadow-xl shadow-black/[0.02] hover:shadow-2xl hover:shadow-[#D4AF37]/10 hover:border-[#D4AF37]/40 transition-all duration-500 group cursor-default"
          >
            <motion.div
              whileHover={{ rotate: 12, scale: 1.1 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#5C131D] to-[#80222D] text-[#D4AF37] group-hover:from-[#D4AF37] group-hover:to-[#F2C94C] group-hover:text-[#5C131D] transition-all duration-500 flex items-center justify-center mx-auto mb-6 shadow-md shadow-[#5C131D]/10"
            >
              {step.icon}
            </motion.div>
            <span className="font-sans text-xs uppercase tracking-widest font-black text-[#D4AF37] block mb-2">{step.time}</span>
            <h3 className="text-2xl italic font-light mb-4 text-[#5C131D]">{step.title}</h3>
            <div className="flex items-center justify-center gap-2 mb-4 text-sm text-[#5C131D]/80">
              <MapPin size={15} className="text-[#D4AF37] shrink-0" />
              <p className="font-sans font-semibold text-xs sm:text-sm">{step.place}</p>
            </div>
            <p className="text-xs sm:text-sm italic text-[#5C131D]/60 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
            {step.link && (
              <div className="mt-6 pt-6 border-t border-[#E0D8D0]/20 space-y-4 flex flex-col items-center">
                <a
                  href={step.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 text-xs font-sans font-black uppercase tracking-wider bg-[#5C131D] text-[#FFFDF9] hover:bg-[#D4AF37] hover:text-[#5C131D] transition-all px-4 py-2.5 rounded-xl shadow-md shadow-[#5C131D]/10 hover:shadow-lg hover:shadow-[#D4AF37]/10 w-full"
                >
                  <MapPin size={14} />
                  Abrir no Google Maps
                </a>

                {step.qrCode && (
                  <div className="p-3 bg-[#FFFDF9] border border-[#E0D8D0]/40 rounded-2xl shadow-sm w-full max-w-[160px] mx-auto text-center">
                    <p className="font-sans text-[9px] uppercase tracking-wider text-[#5C131D]/60 mb-2 font-black">Scan QR Code</p>
                    <div className="aspect-square w-full max-w-[120px] mx-auto overflow-hidden rounded-xl border border-[#5C131D]/5 p-1.5 bg-white flex items-center justify-center">
                      <img
                        src={step.qrCode}
                        alt="QR Code Localização"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
