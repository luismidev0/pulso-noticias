import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { ConfirmModalComponent } from './shared/components/confirm-modal/confirm-modal.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { ToastComponent } from './shared/components/toast/toast.component';

/**
 * Componente raíz: estructura común a todas las páginas.
 *
 * Encabezado + <main> con el <router-outlet> (donde se carga cada página) +
 * pie de página. El toast y el modal se montan una sola vez aquí, porque son
 * globales y los usa cualquier página a través de sus servicios.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastComponent, ConfirmModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="skip-link" href="#contenido" (click)="saltarAlContenido($event)">Saltar al contenido</a>
    <app-header />
    <main class="main" id="contenido" tabindex="-1">
      <router-outlet />
    </main>
    <app-footer />
    <app-toast />
    <app-confirm-modal />
  `,
})
export class App {
  private readonly router = inject(Router);
  private ultimaRuta = '';

  constructor() {
    // Al cambiar de página se vuelve arriba. Los cambios de query params dentro
    // del listado (filtros, búsqueda, paginación) no mueven el scroll.
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe((e) => {
        const ruta = e.urlAfterRedirects.split('?')[0];
        if (ruta !== this.ultimaRuta) window.scrollTo(0, 0);
        this.ultimaRuta = ruta;
      });
  }

  /**
   * Enlace "Saltar al contenido". Con <base href> un enlace "#contenido"
   * recargaría la raíz del sitio, por eso se intercepta y se enfoca <main>.
   */
  protected saltarAlContenido(evento: Event): void {
    evento.preventDefault();
    document.getElementById('contenido')?.focus();
  }
}
