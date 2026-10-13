import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../icon/icon.component';

/** Pie de página común a todas las páginas, con el año calculado al cargar. */
@Component({
  selector: 'app-footer',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer__grid">
          <div class="footer__brand">
            <a class="logo" routerLink="/" aria-label="Pulso, ir al inicio">Pulso<span class="logo__dot">.</span></a>
            <p class="footer__desc">
              Portal de noticias locales organizado por categorías: educación, tecnología, turismo y comercio.
            </p>
            <ul class="social" aria-label="Redes sociales">
              @for (red of redes; track red.nombre) {
                <li>
                  <a class="social__link" href="#" [attr.aria-label]="red.nombre"><app-icon [nombre]="red.icono" /></a>
                </li>
              }
            </ul>
          </div>
          <nav class="footer__nav" aria-label="Navegación del pie de página">
            <h2 class="footer__title">Navegación</h2>
            <ul class="footer__list">
              @for (enlace of enlaces; track enlace.ruta) {
                <li>
                  <a class="footer__link" [routerLink]="enlace.ruta">{{ enlace.texto }}</a>
                </li>
              }
            </ul>
          </nav>
          <div class="footer__col">
            <h2 class="footer__title">Contacto</h2>
            <address class="footer__contact">
              <a class="footer__contact-item" href="mailto:contacto@pulsonoticias.co"
                ><app-icon nombre="mail" />contacto&#64;pulsonoticias.co</a
              >
              <a class="footer__contact-item" href="tel:+576015550142"><app-icon nombre="phone" />+57 (601) 555 0142</a>
              <span class="footer__contact-item"><app-icon nombre="pin" />Bogotá, Colombia</span>
            </address>
          </div>
        </div>
        <div class="footer__bottom">
          <p>© {{ anio }} Pulso. Todos los derechos reservados.</p>
          <p>Proyecto académico</p>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  /** Año dinámico para el aviso de derechos. */
  protected readonly anio = new Date().getFullYear();

  protected readonly enlaces = [
    { ruta: '/', texto: 'Inicio' },
    { ruta: '/noticias', texto: 'Noticias' },
    { ruta: '/favoritos', texto: 'Favoritos' },
    { ruta: '/publicar', texto: 'Publicar' },
    { ruta: '/contacto', texto: 'Contacto' },
  ];

  protected readonly redes = [
    { nombre: 'Facebook', icono: 'facebook' as const },
    { nombre: 'Instagram', icono: 'instagram' as const },
    { nombre: 'X', icono: 'x' as const },
    { nombre: 'YouTube', icono: 'youtube' as const },
  ];
}
