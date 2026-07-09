import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  MapPin,
  Check,
  Users,
  MessageSquare,
  Send,
  Loader2,
  Lock,
  ChevronDown,
  Church,
  PartyPopper,
  Gavel,
  Gift,
  Search,
  Plus,
  Trash2
} from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, where, getDocs } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './lib/firebase';

interface ElegantImageProps {
  src: string;
  alt: string;
  className?: string;
  classNameImg?: string;
  referrerPolicy?: string;
  [key: string]: any;
}

function ElegantImage({ src, alt, className = "", classNameImg = "", referrerPolicy = 'no-referrer', ...props }: ElegantImageProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#F5F2EB] via-[#FDFBF7] to-[#F5F2EB] bg-[length:200%_100%] animate-shimmer" />
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'} ${classNameImg}`}
        onLoad={() => setLoaded(true)}
        referrerPolicy={referrerPolicy}
        {...props}
      />
    </div>
  );
}

const useCountdown = (targetDate: Date) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;
      if (distance < 0) {
        clearInterval(timer);
        return;
      }
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
};

export default function App() {
  const weddingDate = new Date('2026-08-07T10:00:00');
  const countdown = useCountdown(weddingDate);

  // States
  const [guestsList, setGuestsList] = useState<any[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    attending: true,
    guestsCount: 1,
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Admin Add Guest State
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestAllowed, setNewGuestAllowed] = useState(1);
  const [newGuestCategory, setNewGuestCategory] = useState('Familiar');
  const [isAddingGuest, setIsAddingGuest] = useState(false);

  // Message Wall / Wishes State
  const [wishesList, setWishesList] = useState<any[]>([]);
  const [wishName, setWishName] = useState('');
  const [wishMessage, setWishMessage] = useState('');
  const [isSubmittingWish, setIsSubmittingWish] = useState(false);

  // Custom Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
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

  // Fetch Guests List
  useEffect(() => {
    if (isFirebaseConfigured) {
      const q = query(collection(db, 'guests'), orderBy('name', 'asc'));
      return onSnapshot(q, (snapshot) => {
        setGuestsList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    } else {
      const saved = localStorage.getItem('wedding_guests_demo');
      if (saved) {
        setGuestsList(JSON.parse(saved));
      } else {
        const initial = [{ id: 'demo-1', name: 'Convidado de Teste', allowedGuests: 2, confirmed: false }];
        setGuestsList(initial);
        localStorage.setItem('wedding_guests_demo', JSON.stringify(initial));
      }
    }
  }, []);

  // Fetch RSVPs for Admin
  useEffect(() => {
    if (isAdminAuthenticated) {
      if (isFirebaseConfigured) {
        const q = query(collection(db, 'rsvps'), orderBy('createdAt', 'desc'));
        return onSnapshot(q, (snapshot) => {
          setRsvps(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
      } else {
        const saved = localStorage.getItem('wedding_rsvps_demo');
        if (saved) setRsvps(JSON.parse(saved));
      }
    }
  }, [isAdminAuthenticated]);

  // Fetch Wishes List for Message Wall
  useEffect(() => {
    if (isFirebaseConfigured) {
      const q = query(collection(db, 'wishes'), orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
        setWishesList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    } else {
      const saved = localStorage.getItem('wedding_wishes_demo');
      if (saved) {
        setWishesList(JSON.parse(saved));
      } else {
        const initial = [
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuest) {
      showToastMessage("Por favor, selecione seu nome na lista.", "error");
      return;
    }

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

        // Automatically leave a message on the wishes wall if provided
        if (formData.message && formData.message.trim()) {
          await addDoc(collection(db, 'wishes'), {
            name: selectedGuest.name,
            message: formData.message.trim(),
            createdAt: serverTimestamp()
          });
        }
      } else {
        const newRsvp = {
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

        // Automatically leave a message on the wishes wall if provided in demo mode
        if (formData.message && formData.message.trim()) {
          const newWish = {
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
      showToastMessage("Erro ao enviar confirmação.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    const guestName = newGuestName.trim();
    if (!guestName) {
      showToastMessage("Por favor, insira o nome do convidado.", "error");
      return;
    }

    setIsAddingGuest(true);
    try {
      if (isFirebaseConfigured) {
        await addDoc(collection(db, 'guests'), {
          name: guestName,
          allowedGuests: newGuestAllowed,
          category: newGuestCategory,
          confirmed: false
        });
      } else {
        const newGuest = {
          id: 'local-' + Date.now().toString(),
          name: guestName,
          allowedGuests: newGuestAllowed,
          category: newGuestCategory,
          confirmed: false
        };
        const updatedList = [...guestsList, newGuest];
        setGuestsList(updatedList);
        localStorage.setItem('wedding_guests_demo', JSON.stringify(updatedList));
      }
      setNewGuestName('');
      setNewGuestAllowed(1);
      setNewGuestCategory('Familiar');
      showToastMessage("Convidado adicionado com sucesso!", "success");
    } catch (e) {
      console.error(e);
      showToastMessage("Erro ao adicionar convidado.", "error");
    } finally {
      setIsAddingGuest(false);
    }
  };

  const handleDeleteGuest = async (id: string) => {
    try {
      if (isFirebaseConfigured) {
        await deleteDoc(doc(db, 'guests', id));

        // Delete RSVPs associated with this guest
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

        // Delete RSVPs associated with this guest locally
        const updatedRsvps = rsvps.filter(r => r.guestId !== id);
        setRsvps(updatedRsvps);
        localStorage.setItem('wedding_rsvps_demo', JSON.stringify(updatedRsvps));
      }
      showToastMessage("Convidado e a sua confirmação correspondente removidos com sucesso.", "success");
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
      showToastMessage("Confirmação de presença removida com sucesso.", "success");
    } catch (e) {
      console.error(e);
      showToastMessage("Erro ao remover confirmação.", "error");
    }
  };

  const handleDeleteAllRsvps = async () => {
    if (!window.confirm("Tem certeza que deseja remover TODAS as presenças e mensagens desta lista? Esta ação não pode ser desfeita.")) {
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
      showToastMessage("Todas as presenças foram removidas com sucesso.", "success");
    } catch (e) {
      console.error(e);
      showToastMessage("Erro ao remover todas as presenças.", "error");
    }
  };

  const handleAddWish = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = wishName.trim();
    const message = wishMessage.trim();
    if (!name || !message) {
      showToastMessage("Por favor, preencha o seu nome e a sua mensagem.", "error");
      return;
    }

    setIsSubmittingWish(true);
    try {
      if (isFirebaseConfigured) {
        await addDoc(collection(db, 'wishes'), {
          name,
          message,
          createdAt: serverTimestamp()
        });
      } else {
        const newWish = {
          id: 'local-wish-' + Date.now().toString(),
          name,
          message,
          createdAt: new Date().toISOString()
        };
        const updatedList = [newWish, ...wishesList];
        setWishesList(updatedList);
        localStorage.setItem('wedding_wishes_demo', JSON.stringify(updatedList));
      }
      setWishName('');
      setWishMessage('');
      showToastMessage("Mensagem deixada no mural com sucesso! Obrigado pelo carinho! ❤️", "success");
    } catch (err) {
      console.error(err);
      showToastMessage("Erro ao enviar mensagem.", "error");
    } finally {
      setIsSubmittingWish(false);
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

  const filteredGuests = guestsList.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) && !g.confirmed
  );

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#2D1A1C] font-serif selection:bg-[#D4AF37]/30">
           {/* 1. HERO SECTION */}
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
            Bruno Sandande <span className="block md:inline font-sans text-2xl md:text-6xl not-italic text-[#D4AF37] opacity-90 mx-3">&</span> Genoveva Alberto
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
            07 de Agosto de 2026
          </motion.p>

          <div className="grid grid-cols-4 gap-2 sm:gap-4 md:flex md:gap-6 justify-center font-sans max-w-sm sm:max-w-md md:max-w-xl mx-auto w-full px-2">
             {[
               { val: countdown.days, label: 'Dias' },
               { val: countdown.hours, label: 'Horas' },
               { val: countdown.minutes, label: 'Min' },
               { val: countdown.seconds, label: 'Seg' }
             ].map((item, i) => (
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
          onClick={() => document.getElementById('roteiro')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <ChevronDown size={32} strokeWidth={2} />
        </motion.div>
      </section>


      {/* 1.5. MENSAGEM DE BOAS-VINDAS / CONVITE */}
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

      {/* 2. ROTEIRO (ITINERARY) */}
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

           {[
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
           ].map((step, idx) => (
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

      {/* 3. RSVP SECTION (GUEST SELECTION) */}
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
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
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
                              onClick={() => {
                                setSelectedGuest(guest);
                                setFormData(prev => ({ ...prev, guestsCount: guest.allowedGuests }));
                              }}
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
                            onClick={() => setSelectedGuest(null)}
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

      {/* 4. PERTINENT INFO (GIFTS & DRESS CODE) */}
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
              {[
                { name: 'Bruno Sandande (KEVE)', iban: '0047.0000.2841.2596.0612.3' },
                { name: 'Genoveva Alberto (BCI)', iban: '0005.0000.7305.3223.1019.7' }
              ].map((account, i) => (
                <div key={i} className="group relative">
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-[#D4AF37]/35 to-transparent rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition duration-500"></div>
                  <div className="relative bg-[#FFFDF9] border border-[#E0D8D0]/60 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all group-hover:border-[#D4AF37]/40">
                    <div className="text-center sm:text-left">
                      <p className="text-[10px] uppercase font-black tracking-[0.25em] text-[#D4AF37] mb-2">{account.name}</p>
                      <p className="font-mono text-sm tracking-wide text-[#5C131D] select-all break-all font-semibold">{account.iban}</p>
                    </div>
                    <button
                      onClick={() => {
                        try {
                          navigator.clipboard.writeText(account.iban);
                          showToastMessage('IBAN copiado com sucesso!', 'success');
                        } catch (e) {
                          showToastMessage(`IBAN: ${account.iban}`, 'info');
                        }
                      }}
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


      {/* FOOTER */}
      <footer className="py-24 text-center px-6 relative z-10">
        <Heart className="mx-auto mb-6 text-[#D4AF37] fill-[#D4AF37]/15" size={36} strokeWidth={1} />
        <p className="text-3xl sm:text-4xl italic font-light mb-12 text-[#5C131D]">"Deus uniu, ninguém separa."</p>
        <div className="font-sans text-[10px] uppercase tracking-[0.5em] text-[#5C131D]/60 font-black">
          Bruno Sandande & Genoveva Alberto
        </div>

        <button
          onClick={() => setShowAdmin(true)}
          className="mt-20 text-[#5C131D]/40 hover:text-[#5C131D] transition-colors flex items-center gap-2 mx-auto uppercase text-[10px] font-bold tracking-widest bg-white border border-[#E0D8D0]/40 shadow-sm rounded-full py-2 px-6 hover:shadow-md hover:border-[#D4AF37]/30"
        >
          <Lock size={12} /> Painel do Casal
        </button>
      </footer>

      {/* ADMIN PANEL */}
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
                  <button onClick={() => setShowAdmin(false)} className="bg-[#5C131D] text-white p-3 rounded-full hover:bg-[#7D1C28] transition-all duration-300">
                    <Plus size={20} className="rotate-45" />
                  </button>
               </div>

               {!isAdminAuthenticated ? (
                  <div className="max-w-md mx-auto text-center py-20 bg-white p-12 rounded-[2rem] shadow-xl border border-[#E0D8D0]/40 shadow-[#5C131D]/5">
                    <Lock className="mx-auto mb-8 text-[#D4AF37]" size={60} strokeWidth={1.5} />
                    <p className="font-sans text-xs uppercase font-bold text-[#5C131D]/60 mb-10 tracking-widest">Acesso Restrito ao Casal</p>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (adminPassword === 'casamento2026') setIsAdminAuthenticated(true);
                      else showToastMessage("Senha incorreta.", "error");
                    }} className="space-y-6">
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
                           {['Familiar', 'Amigo', 'Irmão em Cristo', 'Vizinho', 'Colega de trabalho', 'Outro'].map((cat) => {
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

                     <div className="bg-white p-10 rounded-[2rem] shadow-xl shadow-[#5C131D]/5 border border-[#E0D8D0]/40 text-[#5C131D]">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                           <Plus className="text-[#D4AF37]" /> Adicionar Convidado à Lista
                        </h3>
                        <form onSubmit={handleAddGuest} className="flex flex-col md:flex-row gap-6">
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
                                    onClick={handleDeleteAllRsvps}
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
                                          <button onClick={() => handleDeleteRsvp(r.id, r.guestId)} className="text-red-300 hover:text-red-600 transition-colors" title="Remover Confirmação">
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
                                           <button onClick={() => handleDeleteWish(w.id)} className="text-red-300 hover:text-red-600 transition-colors">
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
                                          <button onClick={() => handleDeleteGuest(g.id)} className="text-red-300 hover:text-red-600 transition-colors">
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

      {/* Floating Animated Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="fixed bottom-8 right-8 z-[999] max-w-sm w-[calc(100vw-4rem)] p-5 rounded-2xl bg-white border border-[#F1E9E0] shadow-2xl shadow-black/10 flex items-center gap-4 cursor-pointer hover:shadow-3xl transition-shadow"
            onClick={() => setToast(null)}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              toast.type === 'success' ? 'bg-green-50 text-green-600' :
              toast.type === 'error' ? 'bg-red-50 text-red-600' :
              'bg-[#B2945B]/5 text-[#B2945B]'
            }`}>
              {toast.type === 'success' ? <Check size={16} strokeWidth={2.5} /> :
               toast.type === 'error' ? <Plus size={16} className="rotate-45" strokeWidth={2.5} /> :
               <Heart size={16} className="fill-[#B2945B]" />}
            </div>
            <p className="font-sans text-xs font-bold leading-relaxed text-[#222]">
              {toast.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

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
