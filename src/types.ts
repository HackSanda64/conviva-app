export interface Guest {
  id: string;
  name: string;
  allowedGuests: number;
  category?: string;
  confirmed: boolean;
}

export interface RSVP {
  id: string;
  guestId: string;
  name: string;
  attending: boolean;
  guestsCount: number;
  message?: string;
  createdAt: any;
}

export interface Wish {
  id: string;
  name: string;
  message: string;
  createdAt: any;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  message: string;
  type: ToastType;
}

export interface BankAccount {
  name: string;
  iban: string;
}

export interface ItineraryStepConfig {
  title: string;
  time: string;
  place: string;
  desc: string;
  link: string;
}

export interface WeddingConfig {
  id?: string;
  siteTitle?: string;
  weddingDate: string;
  groomName: string;
  brideName: string;
  welcomeTitle: string;
  welcomeText: string;
  dressCodeTitle: string;
  dressCodeSub: string;
  dressCodeDesc: string;
  giftsTitle: string;
  giftsSub: string;
  giftsDesc: string;
  accounts: BankAccount[];
  itinerarySteps: ItineraryStepConfig[];
}
