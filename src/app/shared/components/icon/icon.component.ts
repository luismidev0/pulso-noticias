import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Nombres de los íconos disponibles (equivalen a las claves de js/icons.js de la versión vanilla). */
export type NombreIcono =
  | 'heart'
  | 'heartFilled'
  | 'mail'
  | 'phone'
  | 'pin'
  | 'clock'
  | 'facebook'
  | 'instagram'
  | 'x'
  | 'youtube'
  | 'emptySearch'
  | 'emptyFav'
  | 'checkCircle'
  | 'close'
  | 'alertCircle'
  | 'search'
  | 'alertBig'
  | 'retry'
  | 'share'
  | 'trash'
  | 'fieldAlert'
  | 'check'
  | 'image'
  | 'layers'
  | 'heartOutlineFeature'
  | 'menu'
  | 'upload';

/**
 * Ícono SVG en línea.
 *
 * Reemplaza a js/icons.js: en lugar de guardar los SVG como cadenas de texto
 * e insertarlos con innerHTML, cada ícono es marcado real de la plantilla,
 * elegido con @switch según la propiedad `nombre`. Así no hace falta
 * insertar HTML dinámico.
 *
 * Uso: <app-icon nombre="heart" clase="btn__icon" />
 * La clase se aplica directamente al <svg>, igual que antes con replace().
 * El elemento contenedor usa display: contents para no alterar el layout.
 */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
  @switch (nombre()) {
    @case ("heart") {
      <svg [attr.class]="clase() || null" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"></path></svg>
    }
    @case ("heartFilled") {
      <svg [attr.class]="clase() || null" aria-hidden="true" focusable="false" fill="currentColor" stroke="currentColor" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"></path></svg>
    }
    @case ("mail") {
      <svg [attr.class]="clase() || null" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><rect height="14" rx="2" width="18" x="3" y="5"></rect><path d="M3 7l9 6 9-6"></path></svg>
    }
    @case ("phone") {
      <svg [attr.class]="clase() || null" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"></path></svg>
    }
    @case ("pin") {
      <svg [attr.class]="clase() || null" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"></path><circle cx="12" cy="10" r="2.5"></circle></svg>
    }
    @case ("clock") {
      <svg [attr.class]="clase() || null" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>
    }
    @case ("facebook") {
      <svg [attr.class]="clase() || null" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.6c0-.3.3-.6.6-.6z"></path></svg>
    }
    @case ("instagram") {
      <svg [attr.class]="clase() || null" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><rect height="18" rx="5" width="18" x="3" y="3"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" fill="currentColor" r=".6"></circle></svg>
    }
    @case ("x") {
      <svg [attr.class]="clase() || null" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><path d="M4 4l16 16M20 4l-6.6 7.4M10.6 13.6L4 20"></path></svg>
    }
    @case ("youtube") {
      <svg [attr.class]="clase() || null" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><rect height="14" rx="4" width="20" x="2" y="5"></rect><path d="M10 9l5 3-5 3z" fill="currentColor"></path></svg>
    }
    @case ("emptySearch") {
      <svg [attr.class]="clase() || null" aria-hidden="true" focusable="false" viewBox="0 0 120 120"><circle cx="60" cy="60" fill="#E3E4E8" r="56"></circle><rect fill="#fff" height="58" rx="6" width="46" x="28" y="30"></rect><path d="M38 46h26M38 56h26M38 66h14" stroke="#C9CBD1" stroke-linecap="round" stroke-width="4"></path><circle cx="76" cy="74" fill="#fff" r="14" stroke="#C8102E" stroke-width="4"></circle><path d="M86 84l10 10" stroke="#C8102E" stroke-linecap="round" stroke-width="5"></path></svg>
    }
    @case ("emptyFav") {
      <svg [attr.class]="clase() || null" aria-hidden="true" focusable="false" viewBox="0 0 120 120"><circle cx="60" cy="60" fill="#E3E4E8" r="56"></circle><path d="M60 88s-24-14.5-29.5-29C27 49 33 38 44 38c6.5 0 11.5 3.5 16 9.5 4.5-6 9.5-9.5 16-9.5 11 0 17 11 13.5 21C84 73.5 60 88 60 88z" fill="#fff" stroke="#C8102E" stroke-linejoin="round" stroke-width="4"></path><path d="M92 26v10M87 31h10M24 78v8M20 82h8" stroke="#5C5F66" stroke-linecap="round" stroke-width="3"></path></svg>
    }
    @case ("checkCircle") {
      <svg [attr.class]="clase() || null" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M8 12.5l2.8 2.8L16.5 9.5"></path></svg>
    }
    @case ("close") {
      <svg [attr.class]="clase() || null" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"></path></svg>
    }
    @case ("alertCircle") {
      <svg [attr.class]="clase() || null" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M12 7.5v5.5"></path><path d="M12 16.5h.01"></path></svg>
    }
    @case ("search") {
      <svg [attr.class]="clase() || null" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></svg>
    }
    @case ("alertBig") {
      <svg [attr.class]="clase() || null" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M12 7.5v5.5"></path><path d="M12 16.5h.01"></path></svg>
    }
    @case ("retry") {
      <svg [attr.class]="clase() || null" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 0-2.3 5.7"></path><path d="M20 4v7h-7"></path></svg>
    }
    @case ("share") {
      <svg [attr.class]="clase() || null" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4"></path></svg>
    }
    @case ("trash") {
      <svg [attr.class]="clase() || null" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"></path></svg>
    }
    @case ("fieldAlert") {
      <svg [attr.class]="clase() || null" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M12 7.5v5.5"></path><path d="M12 16.5h.01"></path></svg>
    }
    @case ("check") {
      <svg [attr.class]="clase() || null" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
    }
    @case ("image") {
      <svg [attr.class]="clase() || null" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><rect height="14" rx="2" width="18" x="3" y="5"></rect><circle cx="8.5" cy="10" r="1.5"></circle><path d="M21 16l-5-5-8 8"></path></svg>
    }
    @case ("layers") {
      <svg [attr.class]="clase() || null" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><path d="M12 3l9 5-9 5-9-5 9-5z"></path><path d="M3 13l9 5 9-5"></path></svg>
    }
    @case ("heartOutlineFeature") {
      <svg [attr.class]="clase() || null" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16v4z"></path><path d="M14 6l4 4"></path></svg>
    }
    @case ("menu") {
      <svg [attr.class]="clase() || null" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
    }
    @case ("upload") {
      <svg [attr.class]="clase() || null" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4"/><path d="M7 9l5-5 5 5"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg>
    }
  }
  `,
})
export class IconComponent {
  /** Ícono a mostrar. */
  readonly nombre = input.required<NombreIcono>();
  /** Clases CSS que se aplican al elemento <svg>. */
  readonly clase = input<string>('');
}
