import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

/** Página 404 para cualquier ruta que no exista (`**`). */
@Component({
  selector: 'app-no-encontrada',
  imports: [EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <app-empty-state
        codigo="404"
        titulo="Página no encontrada"
        texto="La dirección que buscas no existe o fue movida."
        botonTexto="Ir al inicio"
        botonLink="/"
      />
    </div>
  `,
})
export class NoEncontradaComponent {}
