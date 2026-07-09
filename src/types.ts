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
