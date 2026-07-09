import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Loader2, Plus, Users, Trash2, MessageSquare } from 'lucide-react';
import { Guest, RSVP, Wish } from '../../types';

interface AdminPanelProps {
  showAdmin: boolean;
  onClose: () => void;
  guestsList: Guest[];
  rsvps: RSVP[];
  wishesList: Wish[];
  onAddGuest: (name: string, category: string, allowedGuests: number) => Promise<void>;
  onDeleteGuest: (id: string) => Promise<void>;
  onDeleteRsvp: (id: string, guestId?: string) => Promise<void>;
  onDeleteAllRsvps: () => Promise<void>;
  onDeleteWish: (id: string) => Promise<void>;
  isFirebaseConfigured: boolean;
  showToastMessage: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function AdminPanel({
  showAdmin,
  onClose,
  guestsList,
  rsvps,
  wishesList,
  onAddGuest,
  onDeleteGuest,
  onDeleteRsvp,
  onDeleteAllRsvps,
  onDeleteWish,
  isFirebaseConfigured,
  showToastMessage
}: AdminPanelProps) {
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Form states for adding guest
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestAllowed, setNewGuestAllowed] = useState(1);
  const [newGuestCategory, setNewGuestCategory] = useState('Familiar');
  const [isAddingGuest, setIsAddingGuest] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'casamento2026') {
      setIsAdminAuthenticated(true);
    } else {
      showToastMessage("Senha incorreta.", "error");
    }
  };

  const handleAddGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const guestName = newGuestName.trim();
    if (!guestName) {
      showToastMessage("Por favor, insira o nome do convidado.", "error");
      return;
    }

    setIsAddingGuest(true);
    try {
      await onAddGuest(guestName, newGuestCategory, newGuestAllowed);
      setNewGuestName('');
      setNewGuestAllowed(1);
      setNewGuestCategory('Familiar');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingGuest(false);
    }
  };

  const categories = ['Familiar', 'Amigo', 'Irmão em Cristo', 'Vizinho', 'Colega de trabalho', 'Outro'];

  return (
    <AnimatePresence>
      {showAdmin && (
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          className="fixed inset-0 z-[100] bg-[#FAF6F0] overflow-y-auto custom-scrollbar"
        >
          <div className="max-w-5xl mx-auto p-8 md:p-16">
            <div className="flex justify-between items-center mb-16">
              <div className="flex items-center gap-6">
                <h2 className="text-4xl italic font-light text-[#5C131D]">Gestão do Casamento</h2>
                <button
                  onClick={() => window.location.reload()}
                  className="p-2 border border-[#E0D8D0] rounded-lg text-[#5C131D] hover:bg-[#5C131D]/5 transition-colors"
                  title="Sincronizar Dados"
                >
                  <Loader2 size={16} />
                </button>
              </div>
              <button
                onClick={onClose}
                className="bg-[#5C131D] text-white p-3 rounded-full hover:bg-[#7D1C28] transition-all duration-300"
              >
                <Plus size={20} className="rotate-45" />
              </button>
            </div>

            {!isAdminAuthenticated ? (
              <div className="max-w-md mx-auto text-center py-20 bg-white p-12 rounded-[2rem] shadow-xl border border-[#E0D8D0]/40 shadow-[#5C131D]/5">
                <Lock className="mx-auto mb-8 text-[#D4AF37]" size={60} strokeWidth={1.5} />
                <p className="font-sans text-xs uppercase font-bold text-[#5C131D]/60 mb-10 tracking-widest">Acesso Restrito ao Casal</p>
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <input
                    type="password"
                    placeholder="Insira o código"
                    className="w-full bg-transparent border-b-2 border-[#E0D8D0] focus:border-[#D4AF37] text-[#5C131D] py-4 text-center focus:outline-none text-2xl font-sans transition-colors placeholder:text-[#5C131D]/30"
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                  />
                  <button type="submit" className="w-full bg-[#5C131D] text-[#FFFDF9] py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-[#7D1C28] active:scale-[0.99] transition-all shadow-md shadow-[#5C131D]/15">
                    Aceder ao Painel
                  </button>
                </form>
                {!isFirebaseConfigured && (
                  <div className="mt-8 p-4 bg-orange-50 rounded-xl text-[10px] text-orange-700 font-sans font-bold uppercase tracking-widest opacity-80 border border-orange-100">
                    Modo de Demonstração (Dados Locais)
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-20 font-sans">
                {/* 5 Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                  {[
                    { l: 'Convites', v: guestsList.length, c: 'bg-white text-[#5C131D] border-[#E0D8D0]/40 shadow-xl shadow-[#5C131D]/5' },
                    { l: 'Confirmados', v: rsvps.filter(r => r.attending).length, c: 'bg-[#5C131D] text-[#FFFDF9] border-[#5C131D] shadow-lg shadow-[#5C131D]/20' },
                    { l: 'Total Pessoas', v: rsvps.reduce((acc, r) => acc + (r.attending ? Number(r.guestsCount || 0) : 0), 0), c: 'bg-white text-[#5C131D] border-[#E0D8D0]/40 shadow-xl shadow-[#5C131D]/5' },
                    { l: 'Recusados', v: rsvps.filter(r => !r.attending).length, c: 'bg-red-50 text-red-600 border-red-100' },
                    { l: 'Recados Mural', v: wishesList.length, c: 'bg-[#FAF6F0] text-[#5C131D] border-[#E0D8D0]/40' }
                  ].map((s, i) => (
                    <div key={i} className={`${s.c} p-8 rounded-3xl border text-center transition-all hover:scale-[1.02] duration-300`}>
                      <span className="text-[10px] uppercase font-black tracking-widest opacity-60 block mb-4">{s.l}</span>
                      <span className="text-4xl font-light">{s.v}</span>
                    </div>
                  ))}
                </div>

                {/* Estatísticas por Categoria */}
                <div className="bg-white p-10 rounded-[2rem] shadow-xl shadow-[#5C131D]/5 border border-[#E0D8D0]/40 text-[#5C131D]">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                      <h3 className="text-xl font-bold flex items-center gap-3">
                        <Users className="text-[#D4AF37]" /> Estatísticas por Categoria
                      </h3>
                      <p className="text-xs text-[#5C131D]/50 uppercase tracking-widest mt-1">Resumo das confirmações segregado por relacionamento</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((cat) => {
                      const catGuests = guestsList.filter(g => (g.category || 'Outro') === cat);
                      const totalInvitations = catGuests.length;
                      const confirmedInvitations = catGuests.filter(g => g.confirmed).length;
                      const pendingInvitations = totalInvitations - confirmedInvitations;

                      const confirmedPeople = catGuests.reduce((acc, g) => {
                        if (!g.confirmed) return acc;
                        const r = rsvps.find(r => r.guestId === g.id && r.attending);
                        return acc + (r ? Number(r.guestsCount || 0) : Number(g.allowedGuests || 0));
                      }, 0);

                      return (
                        <div key={cat} className="p-6 rounded-2xl border border-[#E0D8D0]/30 bg-[#FAF6F0]/20 flex flex-col justify-between hover:border-[#D4AF37]/50 transition-colors">
                          <div className="flex justify-between items-center mb-4">
                            <span className="font-bold text-[#5C131D]">{cat}</span>
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                              cat === 'Familiar' ? 'bg-[#5C131D]/5 text-[#5C131D] border-[#5C131D]/20' :
                              cat === 'Amigo' ? 'bg-amber-50 text-amber-800 border-amber-200/50' :
                              cat === 'Irmão em Cristo' ? 'bg-purple-50 text-purple-800 border-purple-200/50' :
                              cat === 'Vizinho' ? 'bg-teal-50 text-teal-700 border-teal-200/50' :
                              cat === 'Colega de trabalho' ? 'bg-blue-50 text-blue-700 border-blue-200/50' :
                              'bg-gray-50 text-gray-500 border-gray-200/50'
                            }`}>
                              {totalInvitations} Convite{totalInvitations !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center mt-2">
                            <div className="p-2 bg-green-50 rounded-xl border border-green-100">
                              <span className="block text-[8px] uppercase tracking-widest text-green-700 font-bold">Aceitos</span>
                              <span className="text-base font-bold text-green-700">{confirmedInvitations}</span>
                            </div>
                            <div className="p-2 bg-amber-50 rounded-xl border border-amber-100">
                              <span className="block text-[8px] uppercase tracking-widest text-amber-700 font-bold">Pendente</span>
                              <span className="text-base font-bold text-amber-700">{pendingInvitations}</span>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-xl border border-blue-100">
                              <span className="block text-[8px] uppercase tracking-widest text-blue-700 font-bold">Pessoas</span>
                              <span className="text-base font-bold text-blue-700">{confirmedPeople}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Adicionar Convidado Form */}
                <div className="bg-white p-10 rounded-[2rem] shadow-xl shadow-[#5C131D]/5 border border-[#E0D8D0]/40 text-[#5C131D]">
                  <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                    <Plus className="text-[#D4AF37]" /> Adicionar Convidado à Lista
                  </h3>
                  <form onSubmit={handleAddGuestSubmit} className="flex flex-col md:flex-row gap-6">
                    <input
                      type="text"
                      placeholder="Nome do Convidado / Família"
                      className="flex-1 bg-transparent border-b border-[#E0D8D0] py-4 focus:outline-none focus:border-[#D4AF37] text-sm text-[#5C131D] placeholder:text-[#5C131D]/40 transition-colors"
                      value={newGuestName}
                      onChange={e => setNewGuestName(e.target.value)}
                      required
                    />
                    <select
                      className="w-full md:w-48 bg-transparent border-b border-[#E0D8D0] py-4 focus:outline-none focus:border-[#D4AF37] text-sm text-[#5C131D] transition-colors cursor-pointer"
                      value={newGuestCategory}
                      onChange={e => setNewGuestCategory(e.target.value)}
                      required
                    >
                      <option value="Familiar" className="text-[#5C131D] bg-[#FFFDF9]">Familiar</option>
                      <option value="Amigo" className="text-[#5C131D] bg-[#FFFDF9]">Amigo</option>
                      <option value="Irmão em Cristo" className="text-[#5C131D] bg-[#FFFDF9]">Irmão em Cristo</option>
                      <option value="Vizinho" className="text-[#5C131D] bg-[#FFFDF9]">Vizinho</option>
                      <option value="Colega de trabalho" className="text-[#5C131D] bg-[#FFFDF9]">Colega de trabalho</option>
                      <option value="Outro" className="text-[#5C131D] bg-[#FFFDF9]">Outro</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Lugares"
                      className="w-full md:w-24 bg-transparent border-b border-[#E0D8D0] py-4 focus:outline-none focus:border-[#D4AF37] text-sm text-[#5C131D] placeholder:text-[#5C131D]/40 transition-colors"
                      value={newGuestAllowed}
                      onChange={e => setNewGuestAllowed(parseInt(e.target.value) || 1)}
                      required
                    />
                    <button
                      type="submit"
                      disabled={isAddingGuest}
                      className="bg-[#5C131D] text-[#FFFDF9] px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-[#7D1C28] disabled:opacity-50 transition-all shadow-md shadow-[#5C131D]/15 active:scale-[0.98]"
                    >
                      {isAddingGuest ? <Loader2 className="animate-spin shrink-0" size={14} /> : <Plus className="shrink-0" size={14} />}
                      <span>Adicionar</span>
                    </button>
                  </form>
                </div>

                {/* Presenças & Mensagens */}
                <div className="space-y-8">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-[#5C131D]">Presenças & Mensagens</h3>
                      <p className="text-xs text-[#5C131D]/50 uppercase tracking-widest">Resumo detalhado das confirmações</p>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <span className="text-xs font-bold text-[#D4AF37]">{rsvps.filter(r => r.attending).length} Confirmados</span>
                      {rsvps.length > 0 && (
                        <button
                          onClick={onDeleteAllRsvps}
                          className="text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 py-1.5 px-3 rounded-lg border border-red-200 transition-colors flex items-center gap-1.5 animate-fade-in"
                        >
                          <Trash2 size={12} />
                          <span>Limpar Lista</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="overflow-x-auto bg-white rounded-3xl border border-[#E0D8D0]/40 shadow-xl shadow-[#5C131D]/5">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-[#E0D8D0]/40 uppercase text-[10px] tracking-widest text-[#5C131D]/60 font-black">
                          <th className="p-6">Convidado</th>
                          <th className="p-6">Presença</th>
                          <th className="p-6 text-center">Lugares</th>
                          <th className="p-6 min-w-[250px]">Mensagem</th>
                          <th className="p-6 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E0D8D0]/30">
                        {rsvps.length > 0 ? rsvps.map(r => (
                          <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-6 font-bold text-[#5C131D]">{r.name}</td>
                            <td className="p-6">
                              <span className={r.attending ? "text-green-600 font-bold" : "text-red-400 font-bold"}>
                                {r.attending ? "Confirmado" : "Declinado"}
                              </span>
                            </td>
                            <td className="p-6 text-center font-mono font-bold text-lg text-[#5C131D]">
                              {r.attending ? r.guestsCount : "0"}
                            </td>
                            <td className="p-6">
                              {r.message ? (
                                <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#D4AF37]/20 max-w-md shadow-sm">
                                  <div className="flex items-center gap-2 mb-2 text-[#D4AF37]">
                                    <MessageSquare size={14} />
                                    <span className="text-[10px] uppercase font-bold">Mensagem:</span>
                                  </div>
                                  <p className="text-sm font-light italic leading-relaxed text-[#5C131D]/80 font-serif">{r.message}</p>
                                </div>
                              ) : (
                                <span className="opacity-20 italic text-xs text-[#5C131D]">Sem mensagem</span>
                              )}
                            </td>
                            <td className="p-6 text-right">
                              <button
                                onClick={() => onDeleteRsvp(r.id, r.guestId)}
                                className="text-red-300 hover:text-red-600 transition-colors"
                                title="Remover Confirmação"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={5} className="p-20 text-center opacity-30 italic text-[#5C131D]">
                              Nenhuma confirmação recebida ainda.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mural de Recados */}
                <div className="space-y-8">
                  <h3 className="text-xl font-bold text-[#5C131D]">Mensagens do Mural de Recados</h3>
                  <p className="text-xs text-[#5C131D]/50 uppercase tracking-widest mb-6">Controle de recados deixados no mural do casamento</p>
                  <div className="overflow-x-auto bg-white rounded-3xl border border-[#E0D8D0]/40 shadow-xl shadow-[#5C131D]/5 mb-12">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-[#E0D8D0]/40 uppercase text-[10px] tracking-widest text-[#5C131D]/60 font-black">
                          <th className="p-6">Nome</th>
                          <th className="p-6">Mensagem</th>
                          <th className="p-6 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E0D8D0]/30">
                        {wishesList.length > 0 ? wishesList.map(w => (
                          <tr key={w.id} className="hover:bg-gray-50/50 transition-colors text-[#5C131D]">
                            <td className="p-6 font-bold whitespace-nowrap text-[#5C131D]">{w.name}</td>
                            <td className="p-6 italic text-[#5C131D]/80 font-serif">
                              "{w.message}"
                            </td>
                            <td className="p-6 text-right">
                              <button onClick={() => onDeleteWish(w.id)} className="text-red-300 hover:text-red-600 transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={3} className="p-10 text-center opacity-30 italic text-[#5C131D]">
                              Nenhuma mensagem deixada no mural.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Listagem de Convites */}
                <div className="space-y-8">
                  <h3 className="text-xl font-bold text-[#5C131D]">Listagem de Convites</h3>
                  <div className="overflow-x-auto bg-white rounded-3xl border border-[#E0D8D0]/40 shadow-xl shadow-[#5C131D]/5 p-6">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b-2 border-[#E0D8D0]/40 uppercase text-[10px] tracking-widest text-[#5C131D]/60 font-black">
                          <th className="pb-6">Nome</th>
                          <th className="pb-6">Categoria</th>
                          <th className="pb-6">Lugares</th>
                          <th className="pb-6">Status</th>
                          <th className="pb-6 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E0D8D0]/30">
                        {guestsList.map(g => (
                          <tr key={g.id} className="group text-[#5C131D]">
                            <td className="py-6 font-bold text-[#5C131D]">{g.name}</td>
                            <td className="py-6">
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                g.category === 'Familiar' ? 'bg-[#5C131D]/5 text-[#5C131D] border-[#5C131D]/20' :
                                g.category === 'Amigo' ? 'bg-amber-50 text-amber-800 border-amber-200/50' :
                                g.category === 'Irmão em Cristo' ? 'bg-purple-50 text-purple-800 border-purple-200/50' :
                                g.category === 'Vizinho' ? 'bg-teal-50 text-teal-700 border-teal-200/50' :
                                g.category === 'Colega de trabalho' ? 'bg-blue-50 text-blue-700 border-blue-200/50' :
                                'bg-gray-50 text-gray-500 border-gray-200/50'
                              }`}>
                                {g.category || 'Não definido'}
                              </span>
                            </td>
                            <td className="py-6 font-mono font-bold">{g.allowedGuests}</td>
                            <td className="py-6">
                              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${g.confirmed ? 'bg-green-50 text-green-700 border-green-200/50' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                {g.confirmed ? 'Confirmado' : 'Pendente'}
                              </span>
                            </td>
                            <td className="py-6 text-right">
                              <button onClick={() => onDeleteGuest(g.id)} className="text-red-300 hover:text-red-600 transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
