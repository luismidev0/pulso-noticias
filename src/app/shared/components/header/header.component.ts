import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '../icon/icon.component';

/**
 * Encabezado común a todas las páginas, con el menú móvil.
 *
 * El enlace de la página actual se marca con `routerLinkActive` (clase
 * `nav__link--active` y `aria-current="page"`), en lugar de repetir el
 * encabezado en cada HTML con el enlace activo escrito a mano.
 */
@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="header">
      <div class="container header__inner">
        <a class="logo" routerLink="/" aria-label="Pulso, ir al inicio" (click)="menuAbierto.set(false)">
          Pulso<span class="logo__dot">.</span>
        </a>
        <button
          class="nav-toggle"
          type="button"
          [attr.aria-label]="menuAbierto() ? 'Cerrar menú' : 'Abrir menú'"
          [attr.aria-expanded]="menuAbierto()"
          aria-controls="menu-principal"
          (click)="menuAbierto.set(!menuAbierto())"
        >
          <app-icon nombre="menu" />
        </button>
        <nav
          class="header__nav"
          id="menu-principal"
          aria-label="Navegación principal"
          [class.is-open]="menuAbierto()"
        >
          <ul class="nav">
            @for (enlace of enlaces; track enlace.ruta) {
              <li class="nav__item">
                <a
                  class="nav__link"
                  [routerLink]="enlace.ruta"
                  routerLinkActive="nav__link--active"
                  ariaCurrentWhenActive="page"
                  [routerLinkActiveOptions]="{ exact: enlace.ruta === '/' }"
                  (click)="menuAbierto.set(false)"
                  >{{ enlace.texto }}</a
                >
              </li>
            }
          </ul>
        </nav>
        <a
          class="btn btn--primary btn--sm header__cta"
          routerLink="/noticias"
          (click)="menuAbierto.set(false)"
          >Explorar noticias</a
        >
      </div>
    </header>
  `,
})
export class HeaderComponent {
  /** Estado del menú en pantallas pequeñas; se enlaza a `aria-expanded` y a la clase `is-open`. */
  protected readonly menuAbierto = signal(false);

  protected readonly enlaces = [
    { ruta: '/', texto: 'Inicio' },
    { ruta: '/noticias', texto: 'Noticias' },
    { ruta: '/favoritos', texto: 'Favoritos' },
    { ruta: '/publicar', texto: 'Publicar' },
    { ruta: '/contacto', texto: 'Contacto' },
  ];
}
