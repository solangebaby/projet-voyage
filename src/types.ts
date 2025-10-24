export interface Voyageur {
  id: number;
  nom: string;
  prenom: string;
  cni: string;
  genre: string;
  civilite: string;
}

export interface Reservation {
  id: number;
  voyageurId: number;
  date: string;
  statut: 'confirmer' | 'annuler' | 'non confirmer';
  tickets?: Ticket[];
}

export interface Ticket {
  id: number;
  reservationId: number | null;
  trajetId: number;
  type: 'VIP' | 'Non VIP';
  prix: number;
  statut: 'reserver' | 'annuler' | 'non reserver';
  qrCode?: string;
  busId?: number;
  siege?: number;
}

export interface Trajet {
  id: number;
  villeDepart: string;
  villeArrivee: string;
  dateDepart: string;
  dateArrivee: string;
  km: number;
}

export interface Bus {
  id: number;
  matricule: string;
  nombreSieges: number;
}

export interface Paiement {
  id: number;
  reservationId: number;
  datePaiement: string;
  type: 'Momo' | 'Bancaire';
}

export interface Commentaire {
  id: number;
  contenu: string;
}

export interface Voyage {
  id: number;
  date: string;
  trajetId: number;
  voyageurIds: number[];
  ticketIds: number[];
  busId: number;
}


