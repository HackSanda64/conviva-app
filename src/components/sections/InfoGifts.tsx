import { motion } from 'motion/react';
import { Users, Gift } from 'lucide-react';

interface InfoGiftsProps {
  onCopySuccess: (message: string) => void;
  onCopyFallback: (message: string) => void;
}

export function InfoGifts({ onCopySuccess, onCopyFallback }: InfoGiftsProps) {
  const accounts = [
    { name: 'Bruno Sandande (KEVE)', iban: '0047.0000.2841.2596.0612.3' },
    { name: 'Genoveva Alberto (BCI)', iban: '0005.0000.7305.3223.1019.7' }
  ];

  const handleCopyIban = (iban: string) => {
    try {
      navigator.clipboard.writeText(iban);
      onCopySuccess('IBAN copiado com sucesso!');
    } catch (e) {
      onCopyFallback(`IBAN: ${iban}`);
    }
  };

  return (
    <section className="py-32 px-4 max-w-5xl mx-auto grid md:grid-cols-2 gap-12 sm:gap-16 relative z-10">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="p-8 sm:p-12 rounded-[2rem] bg-white border border-[#E0D8D0]/40 shadow-xl shadow-black/[0.01] hover:shadow-2xl hover:border-[#D4AF37]/40 hover:shadow-[#D4AF37]/5 transition-all duration-500 text-center"
      >
        <div className="w-16 h-16 bg-[#5C131D] text-[#D4AF37] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-[#5C131D]/10">
          <Users size={28} />
        </div>
        <h3 className="text-3xl italic font-light mb-4 text-[#5C131D]">Dress Code</h3>
        <p className="font-sans text-xs uppercase tracking-widest font-black mb-6 text-[#D4AF37]">Traje: Formal / Social Completo</p>
        <p className="text-sm italic text-[#5C131D]/75 leading-relaxed">
          O vosso sorriso é o acessório mais importante, mas pedimos que venham elegantes para celebrarmos este dia com todo o brilho que ele merece.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="p-8 sm:p-12 rounded-[2rem] bg-white border border-[#E0D8D0]/40 shadow-xl shadow-black/[0.01] hover:shadow-2xl hover:border-[#D4AF37]/40 hover:shadow-[#D4AF37]/5 transition-all duration-500 text-center"
      >
        <div className="w-16 h-16 bg-[#5C131D] text-[#D4AF37] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-[#5C131D]/10">
          <Gift size={28} />
        </div>
        <h3 className="text-3xl italic font-light mb-4 text-[#5C131D]">Prenda de Casamento</h3>
        <p className="font-sans text-xs uppercase tracking-widest font-black mb-6 text-[#D4AF37]">Sugestão de carinho</p>
        <p className="text-sm italic text-[#5C131D]/75 leading-relaxed mb-8">
          A vossa presença é a nossa maior alegria, porém se desejarem nos presentear, deixamos aqui as informações para transferência bancária:
        </p>
        <div className="space-y-4">
          {accounts.map((account, i) => (
            <div key={i} className="group relative">
              <div className="absolute -inset-[1px] bg-gradient-to-r from-[#D4AF37]/35 to-transparent rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-[#FFFDF9] border border-[#E0D8D0]/60 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all group-hover:border-[#D4AF37]/40">
                <div className="text-center sm:text-left">
                  <p className="text-[10px] uppercase font-black tracking-[0.25em] text-[#D4AF37] mb-2">{account.name}</p>
                  <p className="font-mono text-sm tracking-wide text-[#5C131D] select-all break-all font-semibold">{account.iban}</p>
                </div>
                <button
                  onClick={() => handleCopyIban(account.iban)}
                  className="shrink-0 w-11 h-11 rounded-xl bg-[#5C131D]/5 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#5C131D] transition-all transform hover:rotate-12 active:scale-95"
                  title="Copiar IBAN"
                >
                  <Gift size={18} strokeWidth={2} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
