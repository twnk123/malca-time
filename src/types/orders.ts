import { Narocilo, PostavkaNarocila } from '@/types/database';

export interface OrderWithItems extends Narocilo {
  postavke_narocila: (PostavkaNarocila & { 
    jedi: { id: string; ime: string };
    discount?: {
      id: string;
      tip_popusta: 'procent' | 'znesek';
      vrednost: number;
      naziv?: string;
    } | null;
  })[];
  restavracije: { naziv: string };
  profili: { ime: string; priimek: string };
}