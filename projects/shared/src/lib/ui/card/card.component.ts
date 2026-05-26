import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'm-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styles: [
    `
      :host {
        display: block;
        background-color: var(--m-color-surface);
        border-radius: var(--m-radius-md);
        box-shadow: var(--m-shadow-card);
        padding: var(--m-space-4);
      }
    `,
  ],
})
export class CardComponent {}
