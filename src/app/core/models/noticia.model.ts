/** Identificadores de las categorías del portal. */
export type CategoriaId = 'educacion' | 'tecnologia' | 'turismo' | 'comercio';

/** Categoría de noticias tal como viene en data/noticias.json. */
export interface Categoria {
  id: CategoriaId;
  nombre: string;
}

/**
 * Bloque del cuerpo de un artículo.
 *  - `p`: párrafo (el primero se muestra como entrada o "lead").
 *  - `h2`: subtítulo.
 *  - `cita`: cita textual con autor opcional.
 */
export interface BloqueCuerpo {
  tipo: 'p' | 'h2' | 'cita';
  texto: string;
  autor?: string;
}

/** Noticia del catálogo (del JSON o publicada por el usuario). */
export interface Noticia {
  id: string;
  titulo: string;
  /** Categoría; en la vista previa de Publicar puede ser 'neutral'. */
  categoria: string;
  /** Fecha ISO corta, p. ej. "2026-09-26". */
  fecha: string;
  autor: string;
  /** Minutos de lectura estimados. */
  lectura: number;
  /** Cantidad de lecturas; se usa para ordenar por "más leídas". */
  lecturas: number;
  destacada: boolean;
  resumen: string;
  /** Ruta de la imagen o data URL (JPEG) cuando la sube el usuario. Vacío si no hay. */
  imagen: string;
  imagenAlt: string;
  pieFoto: string;
  cuerpo: BloqueCuerpo[];
  /** true en las noticias creadas por el usuario desde Publicar. */
  propia?: boolean;
}

/** Contenido del archivo data/noticias.json. */
export interface CatalogoJson {
  categorias: Categoria[];
  noticias: Noticia[];
}

/** Mensaje enviado desde el formulario de Contacto. */
export interface Mensaje {
  nombre: string;
  correo: string;
  asunto: string;
  mensaje: string;
  /** Marca de tiempo ISO que se agrega al guardarlo. */
  fecha?: string;
}

/** Datos del formulario Publicar necesarios para crear una noticia. */
export interface DatosNuevaNoticia {
  titulo: string;
  categoria: string;
  autor: string;
  resumen: string;
  cuerpo: string;
  pieFoto: string;
  imagen: string;
}

/**
 * Categorías fijas del portal, en el orden en que se muestran en los chips
 * del listado y en el selector de Publicar. Los nombres vienen en el JSON,
 * pero se declaran aquí para que los controles se pinten desde el primer
 * momento, sin esperar la carga de datos (igual que el HTML estático original).
 */
export const CATEGORIAS: readonly Categoria[] = [
  { id: 'educacion', nombre: 'Educación' },
  { id: 'tecnologia', nombre: 'Tecnología' },
  { id: 'turismo', nombre: 'Turismo' },
  { id: 'comercio', nombre: 'Comercio' },
];
