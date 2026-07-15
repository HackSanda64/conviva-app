import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Loader2, Plus, Users, Trash2, MessageSquare, Edit, Save, PlusCircle, Calendar, CreditCard, Heart, MapPin } from 'lucide-react';
import { Guest, RSVP, Wish, WeddingConfig, BankAccount, ItineraryStepConfig } from '../../types';

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
  weddingConfig: WeddingConfig;
  onUpdateWeddingConfig: (config: WeddingConfig) => Promise<void>;
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
  showToastMessage,
  weddingConfig,
  onUpdateWeddingConfig
}: AdminPanelProps) {
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'edit_content'>('overview');

  // Form states for adding guest
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestAllowed, setNewGuestAllowed] = useState(1);
  const [newGuestCategory, setNewGuestCategory] = useState('Familiar');
  const [isAddingGuest, setIsAddingGuest] = useState(false);

  // Form states for editing config
  const [cfgGroomName, setCfgGroomName] = useState('');
  const [cfgBrideName, setCfgBrideName] = useState('');
  const [cfgWeddingDate, setCfgWeddingDate] = useState('');
  const [cfgWelcomeTitle, setCfgWelcomeTitle] = useState('');
  const [cfgWelcomeText, setCfgWelcomeText] = useState('');
  const [cfgDressCodeTitle, setCfgDressCodeTitle] = useState('');
  const [cfgDressCodeSub, setCfgDressCodeSub] = useState('');
  const [cfgDressCodeDesc, setCfgDressCodeDesc] = useState('');
  const [cfgGiftsTitle, setCfgGiftsTitle] = useState('');
  const [cfgGiftsSub, setCfgGiftsSub] = useState('');
  const [cfgGiftsDesc, setCfgGiftsDesc] = useState('');
  const [cfgAccounts, setCfgAccounts] = useState<BankAccount[]>([]);
  const [cfgItinerarySteps, setCfgItinerarySteps] = useState<ItineraryStepConfig[]>([]);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  useEffect(() => {
    if (weddingConfig) {
      setCfgGroomName(weddingConfig.groomName || '');
      setCfgBrideName(weddingConfig.brideName || '');
      setCfgWeddingDate(weddingConfig.weddingDate || '');
      setCfgWelcomeTitle(weddingConfig.welcomeTitle || '');
      setCfgWelcomeText(weddingConfig.welcomeText || '');
      setCfgDressCodeTitle(weddingConfig.dressCodeTitle || '');
      setCfgDressCodeSub(weddingConfig.dressCodeSub || '');
      setCfgDressCodeDesc(weddingConfig.dressCodeDesc || '');
      setCfgGiftsTitle(weddingConfig.giftsTitle || '');
      setCfgGiftsSub(weddingConfig.giftsSub || '');
      setCfgGiftsDesc(weddingConfig.giftsDesc || '');
      setCfgAccounts(weddingConfig.accounts ? [...weddingConfig.accounts] : []);
      setCfgItinerarySteps(weddingConfig.itinerarySteps ? [...weddingConfig.itinerarySteps] : []);
    }
  }, [weddingConfig]);

  const updateAccount = (idx: number, field: 'name' | 'iban', val: string) => {
    const updated = [...cfgAccounts];
    updated[idx] = { ...updated[idx], [field]: val };
    setCfgAccounts(updated);
  };

  const removeAccount = (idx: number) => {
    setCfgAccounts(cfgAccounts.filter((_, i) => i !== idx));
  };

  const addAccount = () => {
    setCfgAccounts([...cfgAccounts, { name: '', iban: '' }]);
  };

  const updateItineraryStep = (idx: number, field: keyof ItineraryStepConfig, val: string) => {
    const updated = [...cfgItinerarySteps];
    updated[idx] = { ...updated[idx], [field]: val };
    setCfgItinerarySteps(updated);
  };

  const handleSaveConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    try {
      const updatedConfig: WeddingConfig = {
        weddingDate: cfgWeddingDate,
        groomName: cfgGroomName,
        brideName: cfgBrideName,
        welcomeTitle: cfgWelcomeTitle,
        welcomeText: cfgWelcomeText,
        dressCodeTitle: cfgDressCodeTitle,
        dressCodeSub: cfgDressCodeSub,
        dressCodeDesc: cfgDressCodeDesc,
        giftsTitle: cfgGiftsTitle,
        giftsSub: cfgGiftsSub,
        giftsDesc: cfgGiftsDesc,
        accounts: cfgAccounts,
        itinerarySteps: cfgItinerarySteps
      };
      await onUpdateWeddingConfig(updatedConfig);
      showToastMessage("Configurações salvas com sucesso!", "success");
    } catch (err) {
      console.error(err);
      showToastMessage("Erro ao salvar as configurações.", "error");
    } finally {
      setIsSavingConfig(false);
    }
  };

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
              <div className="space-y-12 font-sans">
                {/* Tabs Navigation */}
                <div className="flex border-b border-[#E0D8D0]/40 pb-4">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-3 rounded-xl font-bold text-sm tracking-wide transition-all ${
                      activeTab === 'overview'
                        ? 'bg-[#5C131D] text-[#FFFDF9]'
                        : 'bg-transparent text-[#5C131D]/60 hover:text-[#5C131D]'
                    }`}
                  >
                    Painel Geral
                  </button>
                  <button
                    onClick={() => setActiveTab('edit_content')}
                    className={`px-6 py-3 rounded-xl font-bold text-sm tracking-wide transition-all ml-4 ${
                      activeTab === 'edit_content'
                        ? 'bg-[#5C131D] text-[#FFFDF9]'
                        : 'bg-transparent text-[#5C131D]/60 hover:text-[#5C131D]'
                    }`}
                  >
                    Editar Dizeres & QR Codes
                  </button>
                </div>

                {activeTab === 'overview' ? (
                  <div className="space-y-20">
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
                              <div className="flex justify-between items-center mb-4 gap-2">
                                <span className="font-bold text-[#5C131D] leading-tight">{cat}</span>
                                <span className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
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
                ) : (
                  <form onSubmit={handleSaveConfigSubmit} className="space-y-12 animate-fade-in text-[#5C131D]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-[#E0D8D0]/40 shadow-sm">
                      <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          <Edit className="text-[#D4AF37]" size={20} /> Personalizar Conteúdo do Convite
                        </h3>
                        <p className="text-xs text-[#5C131D]/60 uppercase tracking-widest mt-1">
                          Altere as informações exibidas no site. Os QR codes serão recalculados em tempo real.
                        </p>
                      </div>
                      <button
                        type="submit"
                        disabled={isSavingConfig}
                        className="bg-[#5C131D] text-[#FFFDF9] hover:bg-[#7D1C28] px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-[#5C131D]/15 active:scale-[0.98] self-start sm:self-auto"
                      >
                        {isSavingConfig ? (
                          <Loader2 className="animate-spin shrink-0" size={14} />
                        ) : (
                          <Save className="shrink-0" size={14} />
                        )}
                        <span>Salvar Conteúdo</span>
                      </button>
                    </div>

                    {/* CARD 1: Informações Gerais */}
                    <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-[#E0D8D0]/40 shadow-xl shadow-[#5C131D]/5 space-y-6">
                      <h4 className="text-lg font-bold border-b border-[#E0D8D0]/30 pb-3 flex items-center gap-2">
                        <Calendar size={18} className="text-[#D4AF37]" /> Nomes dos Noivos & Data
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs uppercase font-black tracking-wider text-[#5C131D]/60">Nome do Noivo</label>
                          <input
                            type="text"
                            value={cfgGroomName}
                            onChange={e => setCfgGroomName(e.target.value)}
                            className="w-full bg-[#FAF6F0] border border-[#E0D8D0]/60 rounded-xl px-4 py-3.5 text-sm text-[#5C131D] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all font-sans"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs uppercase font-black tracking-wider text-[#5C131D]/60">Nome da Noiva</label>
                          <input
                            type="text"
                            value={cfgBrideName}
                            onChange={e => setCfgBrideName(e.target.value)}
                            className="w-full bg-[#FAF6F0] border border-[#E0D8D0]/60 rounded-xl px-4 py-3.5 text-sm text-[#5C131D] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all font-sans"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase font-black tracking-wider text-[#5C131D]/60">Data do Casamento (Formato ISO / Texto exibido no cronômetro)</label>
                        <p className="text-[11px] text-[#5C131D]/40 font-mono">Exemplo do cronômetro: 2026-08-07T10:00:00</p>
                        <input
                          type="text"
                          value={cfgWeddingDate}
                          onChange={e => setCfgWeddingDate(e.target.value)}
                          className="w-full bg-[#FAF6F0] border border-[#E0D8D0]/60 rounded-xl px-4 py-3.5 text-sm font-mono text-[#5C131D] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* CARD 2: Seção de Boas-Vindas */}
                    <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-[#E0D8D0]/40 shadow-xl shadow-[#5C131D]/5 space-y-6">
                      <h4 className="text-lg font-bold border-b border-[#E0D8D0]/30 pb-3 flex items-center gap-2">
                        <Heart size={18} className="text-[#D4AF37]" /> Mensagem de Convite / Boas-Vindas
                      </h4>
                      <div className="space-y-2">
                        <label className="text-xs uppercase font-black tracking-wider text-[#5C131D]/60">Título de Boas-Vindas</label>
                        <input
                          type="text"
                          value={cfgWelcomeTitle}
                          onChange={e => setCfgWelcomeTitle(e.target.value)}
                          className="w-full bg-[#FAF6F0] border border-[#E0D8D0]/60 rounded-xl px-4 py-3.5 text-sm text-[#5C131D] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all font-sans"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase font-black tracking-wider text-[#5C131D]/60">Texto do Convite</label>
                        <textarea
                          rows={4}
                          value={cfgWelcomeText}
                          onChange={e => setCfgWelcomeText(e.target.value)}
                          className="w-full bg-[#FAF6F0] border border-[#E0D8D0]/60 rounded-xl px-4 py-3.5 text-sm text-[#5C131D] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all font-sans italic resize-none leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* CARD 3: Etapas do Roteiro (com previews do QR code) */}
                    <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-[#E0D8D0]/40 shadow-xl shadow-[#5C131D]/5 space-y-8">
                      <h4 className="text-lg font-bold border-b border-[#E0D8D0]/30 pb-3 flex items-center gap-2">
                        <MapPin size={18} className="text-[#D4AF37]" /> Etapas do Roteiro & QR Codes de Localização
                      </h4>
                      <div className="space-y-8 divide-y divide-[#E0D8D0]/30">
                        {cfgItinerarySteps.map((step, idx) => (
                          <div key={idx} className={`${idx > 0 ? 'pt-8' : ''} space-y-4`}>
                            <p className="text-xs font-black uppercase tracking-widest text-[#D4AF37] flex items-center gap-1.5">
                              <span>Etapa {idx + 1}:</span>
                              <span className="text-[#5C131D]/60 font-sans normal-case">({idx === 0 ? 'Civil' : idx === 1 ? 'Religiosa' : 'Copo de Água'})</span>
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-[#5C131D]/60">Título da Etapa</label>
                                <input
                                  type="text"
                                  value={step.title}
                                  onChange={e => updateItineraryStep(idx, 'title', e.target.value)}
                                  className="w-full bg-[#FAF6F0] border border-[#E0D8D0]/60 rounded-xl px-3 py-2 text-sm text-[#5C131D] focus:outline-none focus:border-[#D4AF37] transition-all"
                                  required
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-[#5C131D]/60">Horário</label>
                                <input
                                  type="text"
                                  value={step.time}
                                  onChange={e => updateItineraryStep(idx, 'time', e.target.value)}
                                  className="w-full bg-[#FAF6F0] border border-[#E0D8D0]/60 rounded-xl px-3 py-2 text-sm text-[#5C131D] focus:outline-none focus:border-[#D4AF37] transition-all"
                                  required
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-[#5C131D]/60">Nome do Local</label>
                                <input
                                  type="text"
                                  value={step.place}
                                  onChange={e => updateItineraryStep(idx, 'place', e.target.value)}
                                  className="w-full bg-[#FAF6F0] border border-[#E0D8D0]/60 rounded-xl px-3 py-2 text-sm text-[#5C131D] focus:outline-none focus:border-[#D4AF37] transition-all"
                                  required
                                />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-bold text-[#5C131D]/60">Descrição / Instruções do Local</label>
                              <textarea
                                rows={2}
                                value={step.desc}
                                onChange={e => updateItineraryStep(idx, 'desc', e.target.value)}
                                className="w-full bg-[#FAF6F0] border border-[#E0D8D0]/60 rounded-xl px-3 py-2 text-sm text-[#5C131D] focus:outline-none focus:border-[#D4AF37] transition-all resize-none"
                                required
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                              <div className="md:col-span-2 space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-[#5C131D]/60">Link do Google Maps (QR Code gerará automaticamente)</label>
                                <input
                                  type="text"
                                  value={step.link}
                                  onChange={e => updateItineraryStep(idx, 'link', e.target.value)}
                                  className="w-full bg-[#FAF6F0] border border-[#E0D8D0]/60 rounded-xl px-3 py-2 text-xs font-mono text-[#5C131D] focus:outline-none focus:border-[#D4AF37] transition-all"
                                  required
                                />
                              </div>
                              {step.link && (
                                <div className="p-3 bg-[#FAF6F0] rounded-2xl border border-[#E0D8D0]/40 flex items-center gap-3">
                                  <div className="w-12 h-12 bg-white rounded-lg border border-[#E0D8D0]/50 p-1 flex items-center justify-center shrink-0">
                                    <img
                                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(step.link)}`}
                                      alt="QR Code"
                                      className="w-full h-full object-contain"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                  <div className="text-[10px]">
                                    <p className="font-bold uppercase tracking-wider text-[#D4AF37]">QR Code Atual</p>
                                    <p className="text-[#5C131D]/50 truncate max-w-[150px] font-mono">{step.link}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CARD 4: Dress Code & Presentes */}
                    <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-[#E0D8D0]/40 shadow-xl shadow-[#5C131D]/5 space-y-8">
                      <h4 className="text-lg font-bold border-b border-[#E0D8D0]/30 pb-3 flex items-center gap-2">
                        <CreditCard size={18} className="text-[#D4AF37]" /> Dress Code & Presentes (Contas IBAN)
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-[#E0D8D0]/30">
                        {/* Dress Code Column */}
                        <div className="space-y-4">
                          <p className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">Dress Code</p>
                          <div className="space-y-3">
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-bold text-[#5C131D]/60">Título da Seção</label>
                              <input
                                type="text"
                                value={cfgDressCodeTitle}
                                onChange={e => setCfgDressCodeTitle(e.target.value)}
                                className="w-full bg-[#FAF6F0] border border-[#E0D8D0]/60 rounded-xl px-3 py-2 text-sm text-[#5C131D] focus:outline-none focus:border-[#D4AF37] transition-all"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-bold text-[#5C131D]/60">Subtítulo (Estilo Traje)</label>
                              <input
                                type="text"
                                value={cfgDressCodeSub}
                                onChange={e => setCfgDressCodeSub(e.target.value)}
                                className="w-full bg-[#FAF6F0] border border-[#E0D8D0]/60 rounded-xl px-3 py-2 text-sm text-[#5C131D] focus:outline-none focus:border-[#D4AF37] transition-all"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-bold text-[#5C131D]/60">Descrição / Texto Completo</label>
                              <textarea
                                rows={3}
                                value={cfgDressCodeDesc}
                                onChange={e => setCfgDressCodeDesc(e.target.value)}
                                className="w-full bg-[#FAF6F0] border border-[#E0D8D0]/60 rounded-xl px-3 py-2 text-sm text-[#5C131D] focus:outline-none focus:border-[#D4AF37] transition-all resize-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Gifts Column */}
                        <div className="space-y-4 md:pl-8 pt-8 md:pt-0">
                          <p className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">Presentes</p>
                          <div className="space-y-3">
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-bold text-[#5C131D]/60">Título da Seção</label>
                              <input
                                type="text"
                                value={cfgGiftsTitle}
                                onChange={e => setCfgGiftsTitle(e.target.value)}
                                className="w-full bg-[#FAF6F0] border border-[#E0D8D0]/60 rounded-xl px-3 py-2 text-sm text-[#5C131D] focus:outline-none focus:border-[#D4AF37] transition-all"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-bold text-[#5C131D]/60">Subtítulo</label>
                              <input
                                type="text"
                                value={cfgGiftsSub}
                                onChange={e => setCfgGiftsSub(e.target.value)}
                                className="w-full bg-[#FAF6F0] border border-[#E0D8D0]/60 rounded-xl px-3 py-2 text-sm text-[#5C131D] focus:outline-none focus:border-[#D4AF37] transition-all"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-bold text-[#5C131D]/60">Texto Explicativo</label>
                              <textarea
                                rows={3}
                                value={cfgGiftsDesc}
                                onChange={e => setCfgGiftsDesc(e.target.value)}
                                className="w-full bg-[#FAF6F0] border border-[#E0D8D0]/60 rounded-xl px-3 py-2 text-sm text-[#5C131D] focus:outline-none focus:border-[#D4AF37] transition-all resize-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bank Accounts Sub-Section */}
                      <div className="border-t border-[#E0D8D0]/30 pt-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">Contas Bancárias Exibidas para Presentes</p>
                          <button
                            type="button"
                            onClick={addAccount}
                            className="text-xs font-bold text-[#5C131D] hover:text-[#7D1C28] flex items-center gap-1.5 py-1.5 px-3 bg-[#FAF6F0] border border-[#E0D8D0]/50 rounded-lg hover:border-[#D4AF37] transition-all"
                          >
                            <PlusCircle size={14} />
                            <span>Adicionar Conta</span>
                          </button>
                        </div>

                        <div className="space-y-4">
                          {cfgAccounts.map((account, i) => (
                            <div key={i} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4 p-4 bg-[#FAF6F0]/50 border border-[#E0D8D0]/40 rounded-2xl relative group">
                              <div className="flex-1 space-y-1.5">
                                <label className="text-[9px] uppercase font-bold text-[#5C131D]/40">Noivo / Noiva / Detalhes do Banco (ex: Bruno Sandande (KEVE))</label>
                                <input
                                  type="text"
                                  value={account.name}
                                  onChange={e => updateAccount(i, 'name', e.target.value)}
                                  placeholder="Ex: Bruno Sandande (KEVE)"
                                  className="w-full bg-white border border-[#E0D8D0]/60 rounded-xl px-3 py-2 text-sm text-[#5C131D] focus:outline-none focus:border-[#D4AF37] transition-all"
                                  required
                                />
                              </div>
                              <div className="flex-[2] space-y-1.5">
                                <label className="text-[9px] uppercase font-bold text-[#5C131D]/40">IBAN (Apenas números e pontos)</label>
                                <input
                                  type="text"
                                  value={account.iban}
                                  onChange={e => updateAccount(i, 'iban', e.target.value)}
                                  placeholder="Ex: 0047.0000.2841.2596.0612.3"
                                  className="w-full bg-white border border-[#E0D8D0]/60 rounded-xl px-3 py-2 text-sm font-mono text-[#5C131D] focus:outline-none focus:border-[#D4AF37] transition-all"
                                  required
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeAccount(i)}
                                className="sm:mb-1 self-end sm:self-auto text-red-400 hover:text-red-600 bg-white hover:bg-red-50 p-2.5 rounded-xl border border-red-200 transition-colors"
                                title="Remover Conta"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                          {cfgAccounts.length === 0 && (
                            <p className="text-center italic opacity-40 py-6 text-sm">Nenhuma conta bancária adicionada. Clique em "Adicionar Conta" para incluir.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Save Action */}
                    <div className="flex justify-end gap-4 border-t border-[#E0D8D0]/30 pt-6">
                      <button
                        type="submit"
                        disabled={isSavingConfig}
                        className="bg-[#5C131D] text-[#FFFDF9] hover:bg-[#7D1C28] px-10 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-[#5C131D]/15 active:scale-[0.98]"
                      >
                        {isSavingConfig ? (
                          <Loader2 className="animate-spin shrink-0" size={14} />
                        ) : (
                          <Save className="shrink-0" size={14} />
                        )}
                        <span>Salvar Conteúdo</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
