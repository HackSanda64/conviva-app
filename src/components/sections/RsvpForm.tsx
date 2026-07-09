import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronDown, Check, Loader2, Send } from 'lucide-react';
import { Guest } from '../../types';

interface RsvpFormProps {
  guestsList: Guest[];
  onRsvpSubmit: (selectedGuest: Guest, formData: { attending: boolean; guestsCount: number; message: string }) => Promise<void>;
  isSubmitting: boolean;
  submitted: boolean;
}

export function RsvpForm({
  guestsList,
  onRsvpSubmit,
  isSubmitting,
  submitted
}: RsvpFormProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [formData, setFormData] = useState({
    attending: true,
    guestsCount: 1,
    message: ''
  });

  const filteredGuests = guestsList.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) && !g.confirmed
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuest) return;
    onRsvpSubmit(selectedGuest, formData);
  };

  const handleGuestSelect = (guest: Guest) => {
    setSelectedGuest(guest);
    setFormData(prev => ({
      ...prev,
      guestsCount: guest.allowedGuests
    }));
  };

  const handleResetSelection = () => {
    setSelectedGuest(null);
  };

  return (
    <section id="rsvp" className="py-32 bg-[#FAF6F0] border-y border-[#E0D8D0]/50 relative">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white p-6 sm:p-12 md:p-16 rounded-[2.5rem] shadow-2xl shadow-[#5C131D]/5 text-center relative border border-[#E0D8D0]/30"
        >
          <h2 className="text-3xl sm:text-4xl italic font-light mb-4 text-[#5C131D]">Confirmação de Presença</h2>
          {!submitted && (
            <p className="text-xs sm:text-sm italic text-[#5C131D]/70 max-w-md mx-auto mb-8 font-serif leading-relaxed">
              Para nos ajudar a organizar todos os detalhes com carinho, por favor confirme a sua presença até ao dia <strong className="text-[#5C131D] font-bold">25 de Julho de 2026</strong>. Encontre o seu convite pesquisando o seu nome abaixo.
            </p>
          )}

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12"
              >
                <div className="w-20 h-20 bg-[#5C131D]/5 text-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce border border-[#D4AF37]/30">
                  <Check size={40} />
                </div>
                <h3 className="text-2xl font-light mb-6 text-[#5C131D]">Presença Confirmada!</h3>
                <p className="text-sm opacity-80 italic leading-relaxed text-[#5C131D]/75">
                  Agradecemos imenso pela vossa confirmação. <br />
                  Será uma honra indescritível celebrar este dia tão feliz ao vosso lado!
                </p>
              </motion.div>
            ) : (
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-8 text-left font-sans"
                exit={{ opacity: 0 }}
              >
                {!selectedGuest ? (
                  <div className="space-y-6">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-[#5C131D]/60 block mb-1">Procure pelo seu nome na lista de convidados</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C131D]/40" size={18} />
                      <input
                        type="text"
                        className="w-full bg-[#FFFDF9] border border-[#E0D8D0] rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                        placeholder="Escreva o seu nome aqui..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="max-h-[280px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {filteredGuests.length > 0 ? filteredGuests.map(guest => (
                        <button
                          key={guest.id}
                          type="button"
                          onClick={() => handleGuestSelect(guest)}
                          className="w-full text-left px-5 py-4 rounded-xl border border-[#F1E9E0] hover:border-[#D4AF37] hover:bg-[#FFFDF9] transition-all flex justify-between items-center group"
                        >
                          <span className="font-semibold text-sm text-[#5C131D]">{guest.name}</span>
                          <ChevronDown className="-rotate-90 text-[#D4AF37] opacity-60 group-hover:opacity-100 transition-opacity" size={16} />
                        </button>
                      )) : (
                        <p className="text-center py-10 text-[#5C131D]/50 italic text-sm">
                          {searchTerm ? "Nome não encontrado. Certifique-se de que escreveu corretamente ou contacte o casal." : "Comece a digitar o seu nome para encontrar o seu convite..."}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                    <div className="bg-[#5C131D]/5 p-5 rounded-2xl flex justify-between items-center border border-[#5C131D]/10">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-[#5C131D]/50 block mb-1">Convidado Selecionado</span>
                        <p className="text-base font-bold text-[#5C131D]">{selectedGuest.name}</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleResetSelection}
                        className="text-[10px] uppercase tracking-tighter text-[#D4AF37] font-bold hover:underline"
                      >
                        Trocar Nome
                      </button>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-[#5C131D]/60 block mb-1">Teremos a honra de contar com a sua presença?</label>
                      <div className="flex gap-4">
                        {[
                          { label: 'Sim, com muita alegria!', val: true },
                          { label: 'Infelizmente não poderei ir', val: false }
                        ].map((opt) => (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => setFormData({...formData, attending: opt.val})}
                            className={`flex-1 py-4 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all border text-center ${formData.attending === opt.val ? 'bg-[#5C131D] border-[#5C131D] text-[#FFFDF9] shadow-xl shadow-[#5C131D]/20' : 'bg-transparent border-[#E0D8D0] text-[#5C131D]/70 hover:border-[#5C131D]/40'}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {formData.attending && (
                      <div className="space-y-4">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-[#5C131D]/60 block mb-1">De {selectedGuest.allowedGuests} lugar(es) reservado(s) para o seu grupo, quantos serão ocupados?</label>
                        <input
                          type="number"
                          min="1"
                          max={selectedGuest.allowedGuests}
                          className="w-full bg-[#FFFDF9] border border-[#E0D8D0] rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                          value={formData.guestsCount}
                          onChange={e => setFormData({...formData, guestsCount: parseInt(e.target.value) || 1})}
                        />
                      </div>
                    )}

                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-[#5C131D]/60 block mb-1">Deixe uma mensagem ou conselho carinhoso para nós: (Opcional)</label>
                      <textarea
                        rows={3}
                        className="w-full bg-[#FFFDF9] border border-[#E0D8D0] rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                        placeholder="Escreva aqui as suas palavras de carinho, votos ou conselhos para a nossa nova vida..."
                        value={formData.message}
                        onChange={e => setFormData({...formData, message: e.target.value})}
                      />
                    </div>

                    <button
                      disabled={isSubmitting}
                      type="submit"
                      className="w-full bg-[#5C131D] text-[#FFFDF9] py-5 rounded-2xl hover:bg-[#7D1C28] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-[#5C131D]/20 flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                      Confirmar Presença Agora
                    </button>
                  </motion.div>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
