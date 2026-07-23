import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronDown, Check, Loader2, Send, Phone } from 'lucide-react';
import { Guest } from '../../types';

export function formatAngolaPhone(value: string): string {
  let digits = value.replace(/\D/g, '');
  if (!digits) return '';

  if (!digits.startsWith('9')) {
    digits = '9' + digits;
  }

  digits = digits.slice(0, 9);

  if (digits.length <= 3) {
    return digits;
  } else if (digits.length <= 6) {
    return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  } else {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
}

interface RsvpFormProps {
  guestsList: Guest[];
  onRsvpSubmit: (selectedGuest: Guest, formData: { attending: boolean; guestsCount: number; message: string; phone: string; invitedBy: string }) => Promise<void>;
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
  const [phoneError, setPhoneError] = useState('');
  const [formData, setFormData] = useState({
    attending: true,
    guestsCount: 1,
    message: '',
    phone: '',
    invitedBy: 'Bruno Sandande (Noivo)'
  });

  const filteredGuests = guestsList.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) && !g.confirmed
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuest) return;

    const rawDigits = formData.phone.replace(/\D/g, '');
    if (rawDigits.length !== 9 || !rawDigits.startsWith('9')) {
      setPhoneError('O número de telefone deve ter 9 dígitos e começar por 9 (ex: 923 456 789).');
      return;
    }

    setPhoneError('');
    onRsvpSubmit(selectedGuest, formData);
  };

  const handleGuestSelect = (guest: Guest) => {
    setSelectedGuest(guest);
    setPhoneError('');
    setFormData(prev => ({
      ...prev,
      guestsCount: guest.allowedGuests,
      phone: guest.phone ? formatAngolaPhone(guest.phone) : '9',
      invitedBy: guest.invitedBy || 'Bruno Sandande (Noivo)'
    }));
  };

  const handleResetSelection = () => {
    setSelectedGuest(null);
    setPhoneError('');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAngolaPhone(e.target.value);
    setFormData({ ...formData, phone: formatted });
    if (phoneError) setPhoneError('');
  };

  const handlePhoneFocus = () => {
    if (!formData.phone) {
      setFormData(prev => ({ ...prev, phone: '9' }));
    }
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

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-[#5C131D]/60 block mb-1">
                        Número de Telefone / WhatsApp (9 dígitos, começa por 9) <span className="text-[#D4AF37]">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C131D]/40" size={18} />
                        <input
                          type="tel"
                          required
                          maxLength={11}
                          className={`w-full bg-[#FFFDF9] border ${phoneError ? 'border-red-500 ring-1 ring-red-500' : 'border-[#E0D8D0]'} rounded-2xl py-4 pl-12 pr-4 text-sm font-mono tracking-wider font-semibold focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]`}
                          placeholder="9XX XXX XXX"
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          onFocus={handlePhoneFocus}
                        />
                      </div>
                      {phoneError ? (
                        <p className="text-xs text-red-600 font-medium pl-1">{phoneError}</p>
                      ) : (
                        <p className="text-[10px] text-[#5C131D]/50 italic pl-1">Exemplo: 923 456 789 (Mascara automática de 9 dígitos)</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-[#5C131D]/60 block mb-1">
                        Foi convidado(a) por quem? <span className="text-[#D4AF37]">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {[
                          { id: 'Bruno Sandande (Noivo)', label: 'Bruno Sandande', sub: 'Noivo', icon: '🤵' },
                          { id: 'Genoveva Alberto (Noiva)', label: 'Genoveva Alberto', sub: 'Noiva', icon: '👰' },
                          { id: 'Ambos (Noivo & Noiva)', label: 'Ambos', sub: 'Casal / Família', icon: '💑' }
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, invitedBy: item.id })}
                            className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                              formData.invitedBy === item.id
                                ? 'bg-[#5C131D] text-white border-[#D4AF37] shadow-md shadow-[#5C131D]/20 ring-1 ring-[#D4AF37]'
                                : 'bg-[#FFFDF9] text-[#5C131D] border-[#E0D8D0] hover:border-[#D4AF37]/60'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-2">
                              <span className="text-base">{item.icon}</span>
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                formData.invitedBy === item.id ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-[#E0D8D0]'
                              }`}>
                                {formData.invitedBy === item.id && <Check size={10} className="text-white" />}
                              </div>
                            </div>
                            <div>
                              <span className="text-xs font-bold block leading-tight">{item.label}</span>
                              <span className={`text-[10px] block mt-0.5 ${formData.invitedBy === item.id ? 'text-[#D4AF37]' : 'text-[#5C131D]/60'}`}>
                                {item.sub}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

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
