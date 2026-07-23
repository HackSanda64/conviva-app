import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, where, getDocs, addDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured, auth } from './lib/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}
//
interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Types
import { Guest, RSVP, Wish, ToastMessage, WeddingConfig } from './types';

// Components
import { Toast } from './components/ui/Toast';
import { Hero } from './components/sections/Hero';
import { Welcome } from './components/sections/Welcome';
import { Itinerary } from './components/sections/Itinerary';
import { RsvpForm } from './components/sections/RsvpForm';
import { InfoGifts } from './components/sections/InfoGifts';
import { Footer } from './components/sections/Footer';
import { AdminPanel } from './components/sections/AdminPanel';

const defaultWeddingConfig: WeddingConfig = {
  groomName: 'Bruno Sandande',
  brideName: 'Genoveva Alberto',
  weddingDate: '2026-08-07T16:00:00',
  welcomeTitle: 'Queridos Amigos e Familiares',
  welcomeText: 'Com a bênção de Deus e o carinho das nossas famílias, temos a imensa alegria de convidar-vos para celebrar connosco o dia em que uniremos as nossas vidas. A vossa presença é o maior presente e completará a nossa felicidade nesta linda celebração de amor.',
  dressCodeTitle: 'Dress Code',
  dressCodeSub: 'Traje: Formal / Social Completo',
  dressCodeDesc: 'O vosso sorriso é o acessório mais importante, mas pedimos que venham elegantes para celebrarmos este dia com todo o brilho que ele merece.',
  giftsTitle: 'Prenda de Casamento',
  giftsSub: 'Sugestão de carinho',
  giftsDesc: 'A vossa presença é a nossa maior alegria, porém se desejarem nos presentear, deixamos aqui as informações para transferência bancária:',
  accounts: [
    { name: 'Bruno Sandande (KEVE)', iban: '0047.0000.2841.2596.0612.3' },
    { name: 'Genoveva Alberto (BCI)', iban: '0005.0000.7305.3223.1019.7' }
  ],
  itinerarySteps: [
    {
      title: 'Casamento Civil',
      time: '09:00',
      place: 'Conservatória do SIAC no Zango 4',
      desc: 'O início da nossa caminhada legal, onde assinamos o nosso primeiro \'Sim\' oficial perante a lei.',
      link: 'https://maps.app.goo.gl/yTfaFM6yrqC7ppVeA'
    },
    {
      title: 'Cerimónia Religiosa',
      time: '16:00',
      place: 'Camama, Bairro Simione',
      desc: 'Rua Mufulama. A nossa bênção diante de Deus para selar os nossos votos de amor eterno. Venha testemunhar este momento sagrado!',
      link: 'https://maps.app.goo.gl/CoPx9C6TdSLbfnjZ9'
    },
    {
      title: 'Copo de Água & Festa',
      time: '21:00',
      place: 'Jango do Kikuxi',
      desc: 'Momento de celebrar a nossa união com um jantar especial, brindes, risadas e muita dança. Junte-se à festa!',
      link: 'https://maps.app.goo.gl/iPhHzKyhUYZNiM5MA'
    }
  ]
};

export default function App() {
  const [weddingConfig, setWeddingConfig] = useState<WeddingConfig>(defaultWeddingConfig);

  // Core Data States
  const [guestsList, setGuestsList] = useState<Guest[]>([]);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [wishesList, setWishesList] = useState<Wish[]>([]);

  // Navigation & Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  // Custom Toast State
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToastMessage = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch wedding configuration from Firestore
  useEffect(() => {
    if (isFirebaseConfigured) {
      const configDocRef = doc(db, 'configs', 'wedding_config');
      return onSnapshot(configDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setWeddingConfig(docSnap.data() as WeddingConfig);
        } else {
          setDoc(configDocRef, defaultWeddingConfig).catch(err => {
            console.error("Error creating initial wedding_config:", err);
          });
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'configs/wedding_config');
      });
    } else {
      const saved = localStorage.getItem('wedding_config_demo');
      if (saved) {
        setWeddingConfig(JSON.parse(saved));
      } else {
        localStorage.setItem('wedding_config_demo', JSON.stringify(defaultWeddingConfig));
      }
    }
  }, []);

  // Fetch Guests List
  useEffect(() => {
    if (isFirebaseConfigured) {
      const q = query(collection(db, 'guests'), orderBy('name', 'asc'));
      return onSnapshot(q, (snapshot) => {
        setGuestsList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Guest)));
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'guests');
      });
    } else {
      const saved = localStorage.getItem('wedding_guests_demo');
      if (saved) {
        setGuestsList(JSON.parse(saved));
      } else {
        const initial: Guest[] = [{ id: 'demo-1', name: 'Convidado de Teste', allowedGuests: 2, confirmed: false, category: 'Familiar' }];
        setGuestsList(initial);
        localStorage.setItem('wedding_guests_demo', JSON.stringify(initial));
      }
    }
  }, []);

  // Fetch RSVPs
  useEffect(() => {
    if (isFirebaseConfigured) {
      const q = query(collection(db, 'rsvps'), orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
        setRsvps(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RSVP)));
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'rsvps');
      });
    } else {
      const saved = localStorage.getItem('wedding_rsvps_demo');
      if (saved) {
        setRsvps(JSON.parse(saved));
      } else {
        setRsvps([]);
      }
    }
  }, []);

  // Fetch Wishes List
  useEffect(() => {
    if (isFirebaseConfigured) {
      const q = query(collection(db, 'wishes'), orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
        setWishesList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Wish)));
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'wishes');
      });
    } else {
      const saved = localStorage.getItem('wedding_wishes_demo');
      if (saved) {
        setWishesList(JSON.parse(saved));
      } else {
        const initial: Wish[] = [
          {
            id: 'demo-wish-1',
            name: 'Maria e João Silva',
            message: 'Que a vossa união seja repleta de amor, cumplicidade e muitas felicidades! Estamos muito ansiosos por celebrar este grande dia convosco! ❤️',
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
          },
          {
            id: 'demo-wish-2',
            name: 'Família Santos',
            message: 'Desejamos toda a felicidade do mundo para este casal maravilhoso. Que Deus abençoe ricamente esta nova caminhada. Um grande abraço de toda a família!',
            createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
          }
        ];
        setWishesList(initial);
        localStorage.setItem('wedding_wishes_demo', JSON.stringify(initial));
      }
    }
  }, []);

  // Handlers for RSVP submissions
  const handleRsvpSubmit = async (
    selectedGuest: Guest,
    formData: { attending: boolean; guestsCount: number; message: string }
  ) => {
    setIsSubmitting(true);
    try {
      if (isFirebaseConfigured) {
        await addDoc(collection(db, 'rsvps'), {
          guestId: selectedGuest.id,
          name: selectedGuest.name,
          attending: formData.attending,
          guestsCount: formData.attending ? formData.guestsCount : 0,
          message: formData.message,
          createdAt: serverTimestamp()
        });
        const guestRef = doc(db, 'guests', selectedGuest.id);
        await updateDoc(guestRef, { confirmed: true });

        if (formData.message && formData.message.trim()) {
          await addDoc(collection(db, 'wishes'), {
            name: selectedGuest.name,
            message: formData.message.trim(),
            createdAt: serverTimestamp()
          });
        }
      } else {
        const newRsvp: RSVP = {
          id: Date.now().toString(),
          guestId: selectedGuest.id,
          name: selectedGuest.name,
          attending: formData.attending,
          guestsCount: formData.attending ? formData.guestsCount : 0,
          message: formData.message,
          createdAt: new Date().toISOString()
        };
        const currentRsvps = [...rsvps, newRsvp];
        setRsvps(currentRsvps);
        localStorage.setItem('wedding_rsvps_demo', JSON.stringify(currentRsvps));

        const updatedGuests = guestsList.map(g => g.id === selectedGuest.id ? { ...g, confirmed: true } : g);
        setGuestsList(updatedGuests);
        localStorage.setItem('wedding_guests_demo', JSON.stringify(updatedGuests));

        if (formData.message && formData.message.trim()) {
          const newWish: Wish = {
            id: 'local-wish-' + Date.now().toString(),
            name: selectedGuest.name,
            message: formData.message.trim(),
            createdAt: new Date().toISOString()
          };
          const updatedWishes = [newWish, ...wishesList];
          setWishesList(updatedWishes);
          localStorage.setItem('wedding_wishes_demo', JSON.stringify(updatedWishes));
        }
      }
      setSubmitted(true);
    } catch (error) {
      console.error("Error:", error);
      showToastMessage("Erro ao enviar confirmação de presença.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers for Admin Operations
  const handleAddGuest = async (name: string, category: string, allowedGuests: number) => {
    try {
      if (isFirebaseConfigured) {
        await addDoc(collection(db, 'guests'), {
          name,
          allowedGuests,
          category,
          confirmed: false
        });
      } else {
        const newGuest: Guest = {
          id: 'local-' + Date.now().toString(),
          name,
          allowedGuests,
          category,
          confirmed: false
        };
        const updatedList = [...guestsList, newGuest];
        setGuestsList(updatedList);
        localStorage.setItem('wedding_guests_demo', JSON.stringify(updatedList));
      }
      showToastMessage("Convidado adicionado com sucesso!", "success");
    } catch (e) {
      console.error(e);
      showToastMessage("Erro ao adicionar convidado.", "error");
      throw e;
    }
  };

  const handleDeleteGuest = async (id: string) => {
    try {
      if (isFirebaseConfigured) {
        await deleteDoc(doc(db, 'guests', id));

        try {
          const rsvpsQuery = query(collection(db, 'rsvps'), where('guestId', '==', id));
          const rsvpsSnapshot = await getDocs(rsvpsQuery);
          for (const docSnap of rsvpsSnapshot.docs) {
            await deleteDoc(doc(db, 'rsvps', docSnap.id));
          }
        } catch (rsvpErr) {
          console.error("Erro ao remover presenças associadas:", rsvpErr);
        }
      } else {
        const updatedList = guestsList.filter(g => g.id !== id);
        setGuestsList(updatedList);
        localStorage.setItem('wedding_guests_demo', JSON.stringify(updatedList));

        const updatedRsvps = rsvps.filter(r => r.guestId !== id);
        setRsvps(updatedRsvps);
        localStorage.setItem('wedding_rsvps_demo', JSON.stringify(updatedRsvps));
      }
      showToastMessage("Convidado e confirmação correspondente removidos.", "success");
    } catch (e) {
      console.error(e);
      showToastMessage("Erro ao remover convidado.", "error");
    }
  };

  const handleDeleteRsvp = async (id: string, guestId?: string) => {
    try {
      if (isFirebaseConfigured) {
        await deleteDoc(doc(db, 'rsvps', id));
        if (guestId) {
          const guestRef = doc(db, 'guests', guestId);
          await updateDoc(guestRef, { confirmed: false });
        }
      } else {
        const updatedRsvps = rsvps.filter(r => r.id !== id);
        setRsvps(updatedRsvps);
        localStorage.setItem('wedding_rsvps_demo', JSON.stringify(updatedRsvps));

        if (guestId) {
          const updatedGuests = guestsList.map(g => g.id === guestId ? { ...g, confirmed: false } : g);
          setGuestsList(updatedGuests);
          localStorage.setItem('wedding_guests_demo', JSON.stringify(updatedGuests));
        }
      }
      showToastMessage("Confirmação de presença removida.", "success");
    } catch (e) {
      console.error(e);
      showToastMessage("Erro ao remover confirmação.", "error");
    }
  };

  const handleDeleteAllRsvps = async () => {
    if (!window.confirm("Tem certeza que deseja remover TODAS as presenças desta lista? Esta ação não pode ser desfeita.")) {
      return;
    }
    try {
      if (isFirebaseConfigured) {
        const rsvpsQuery = query(collection(db, 'rsvps'));
        const rsvpsSnapshot = await getDocs(rsvpsQuery);
        for (const docSnap of rsvpsSnapshot.docs) {
          await deleteDoc(doc(db, 'rsvps', docSnap.id));
        }

        const guestsQuery = query(collection(db, 'guests'));
        const guestsSnapshot = await getDocs(guestsQuery);
        for (const docSnap of guestsSnapshot.docs) {
          if (docSnap.data().confirmed) {
            await updateDoc(doc(db, 'guests', docSnap.id), { confirmed: false });
          }
        }
      } else {
        setRsvps([]);
        localStorage.setItem('wedding_rsvps_demo', JSON.stringify([]));

        const updatedGuests = guestsList.map(g => ({ ...g, confirmed: false }));
        setGuestsList(updatedGuests);
        localStorage.setItem('wedding_guests_demo', JSON.stringify(updatedGuests));
      }
      showToastMessage("Todas as presenças foram limpas.", "success");
    } catch (e) {
      console.error(e);
      showToastMessage("Erro ao limpar presenças.", "error");
    }
  };

  const handleDeleteWish = async (id: string) => {
    try {
      if (isFirebaseConfigured) {
        await deleteDoc(doc(db, 'wishes', id));
      } else {
        const updatedList = wishesList.filter(w => w.id !== id);
        setWishesList(updatedList);
        localStorage.setItem('wedding_wishes_demo', JSON.stringify(updatedList));
      }
      showToastMessage("Mensagem removida com sucesso.", "success");
    } catch (err) {
      console.error(err);
      showToastMessage("Erro ao remover mensagem.", "error");
    }
  };

  const handleUpdateWeddingConfig = async (config: WeddingConfig) => {
    try {
      if (isFirebaseConfigured) {
        const configDocRef = doc(db, 'configs', 'wedding_config');
        await setDoc(configDocRef, config);
      } else {
        setWeddingConfig(config);
        localStorage.setItem('wedding_config_demo', JSON.stringify(config));
      }
      showToastMessage("Configurações atualizadas com sucesso!", "success");
    } catch (err) {
      console.error(err);
      showToastMessage("Erro ao atualizar as configurações.", "error");
      throw err;
    }
  };

  const formatWeddingDateText = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "07 de Agosto de 2026";
      const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
      ];
      return `${d.getDate().toString().padStart(2, '0')} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
    } catch {
      return "07 de Agosto de 2026";
    }
  };

  const currentWeddingDate = weddingConfig && weddingConfig.weddingDate ? new Date(weddingConfig.weddingDate) : new Date('2026-08-07T16:00:00');

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#2D1A1C] font-serif selection:bg-[#D4AF37]/30">
      {/* Hero Section */}
      <Hero
        weddingDate={currentWeddingDate}
        groomName={weddingConfig.groomName}
        brideName={weddingConfig.brideName}
        subTitle={formatWeddingDateText(weddingConfig.weddingDate)}
      />

      {/* Welcome / Convite */}
      <Welcome
        title={weddingConfig.welcomeTitle}
        text={weddingConfig.welcomeText}
      />

      {/* Itinerary / Roteiro */}
      <Itinerary steps={weddingConfig.itinerarySteps} />

      {/* RSVP Section */}
      <RsvpForm
        guestsList={guestsList}
        onRsvpSubmit={handleRsvpSubmit}
        isSubmitting={isSubmitting}
        submitted={submitted}
      />

      {/* Info, Gifts & Dress Code */}
      <InfoGifts
        onCopySuccess={(msg) => showToastMessage(msg, 'success')}
        onCopyFallback={(msg) => showToastMessage(msg, 'info')}
        dressCodeTitle={weddingConfig.dressCodeTitle}
        dressCodeSub={weddingConfig.dressCodeSub}
        dressCodeDesc={weddingConfig.dressCodeDesc}
        giftsTitle={weddingConfig.giftsTitle}
        giftsSub={weddingConfig.giftsSub}
        giftsDesc={weddingConfig.giftsDesc}
        accounts={weddingConfig.accounts}
      />

      {/* Footer */}
      <Footer onShowAdmin={() => setShowAdmin(true)} />

      {/* Admin Panel Overlay */}
      <AdminPanel
        showAdmin={showAdmin}
        onClose={() => setShowAdmin(false)}
        guestsList={guestsList}
        rsvps={rsvps}
        wishesList={wishesList}
        onAddGuest={handleAddGuest}
        onDeleteGuest={handleDeleteGuest}
        onDeleteRsvp={handleDeleteRsvp}
        onDeleteAllRsvps={handleDeleteAllRsvps}
        onDeleteWish={handleDeleteWish}
        isFirebaseConfigured={isFirebaseConfigured}
        showToastMessage={showToastMessage}
        weddingConfig={weddingConfig}
        onUpdateWeddingConfig={handleUpdateWeddingConfig}
      />

      {/* Floating Animated Toast Alert */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Styles for Custom Animations */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 10s infinite ease-in-out;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite linear;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #B2945B;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
