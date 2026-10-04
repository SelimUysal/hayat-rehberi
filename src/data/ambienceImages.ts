export interface AmbienceSlide {
  id: string;
  title: string;
  location: string;
  imageUrl: string;
  description: string;
}

export const AMBIENCE_SLIDES: AmbienceSlide[] = [
  {
    id: '1',
    title: 'Mescid-i Haram',
    location: 'Mekke-i Mükerreme',
    imageUrl: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?auto=format&fit=crop&w=1920&q=80',
    description: 'Kâbe-i Muazzama ve tavaf huzuru.'
  },
  {
    id: '2',
    title: 'Mescid-i Nebevî',
    location: 'Medine-i Münevvere',
    imageUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1920&q=80',
    description: 'Ravza-i Mutahhara ve Kubbe-i Hadrâ.'
  },
  {
    id: '3',
    title: 'Ayasofya-i Kebîr Cami-i Şerifi',
    location: 'İstanbul',
    imageUrl: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1920&q=80',
    description: 'Asırlık kubbelerde yankılanan Kur\'an tilaveti.'
  },
  {
    id: '4',
    title: 'Sultanahmet Camii',
    location: 'İstanbul',
    imageUrl: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1920&q=80',
    description: 'Altı minareli tarihi mabette seher vakti.'
  }
];
