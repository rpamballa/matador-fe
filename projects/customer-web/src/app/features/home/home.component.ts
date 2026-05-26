import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent } from '@matador/shared';

@Component({
  selector: 'customer-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  template: `
    <section class="home">
      <h1>Hey there</h1>
      <p>50+ cars available near you.</p>
      <m-button variant="primary" [block]="true">New Trip</m-button>
    </section>
  `,
  styles: [
    `
      .home {
        padding: var(--m-space-6);
      }
    `,
  ],
})
export class HomeComponent {}
