import { Narocilo, PostavkaNarocila } from '@/types/database';

export interface OrderWithItems extends Narocilo {
  postavke_narocila: (PostavkaNarocila & { jedi: { ime: string } })[];
  restavracije: { naziv: string };
  profili: { ime: string; priimek: string };
}