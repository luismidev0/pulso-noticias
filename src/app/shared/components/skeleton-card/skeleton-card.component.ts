import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Tarjeta en versión esqueleto, mientras se cargan los datos. */
@Component({
  selector: 'app-skeleton-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <article class="card" aria-hidden="true">
      <span class="skeleton skeleton--media"></span>
      <div class="card__body">
        <span class="skeleton skeleton--badge"></span>
        <div class="skeleton-stack">
          <span class="skeleton skeleton--title"></span>
          <span class="skeleton skeleton--title" style="width: 70%"></span>
        </div>
        <span class="skeleton skeleton--small"></span>
        <div class="skeleton-stack">
          <span class="skeleton skeleton--line"></span>
          <span class="skeleton skeleton--line" style="width: 85%"></span>
        </div>
        <div class="card__footer"><span class="skeleton skeleton--btn"></span></div>
      </div>
    </article>
  `,
})
export class SkeletonCardComponent {}
