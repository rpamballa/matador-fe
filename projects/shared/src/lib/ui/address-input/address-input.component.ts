import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { StructuredAddress } from '../../models/address';

/**
 * Address input as a ControlValueAccessor. Google Places autocomplete is
 * deferred; for now this captures a free-text label into a StructuredAddress.
 * When Places is wired up, selection should populate location + components.
 */
@Component({
  selector: 'm-address-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AddressInputComponent),
      multi: true,
    },
  ],
  template: `
    <input
      class="address-input"
      type="text"
      [attr.placeholder]="placeholder()"
      [value]="label()"
      [disabled]="disabled()"
      (input)="onInput($event)"
      (blur)="onTouched()"
    />
  `,
  styles: [
    `
      .address-input {
        width: 100%;
        height: 44px;
        padding: 0 var(--m-space-3);
        border: 1px solid var(--m-color-border);
        border-radius: var(--m-radius-md);
        font: inherit;
        background: var(--m-color-surface);
      }
    `,
  ],
})
export class AddressInputComponent implements ControlValueAccessor {
  readonly placeholder = input('Enter an address');
  readonly label = signal('');
  readonly disabled = signal(false);

  private onChange: (value: StructuredAddress | null) => void = () => void 0;
  onTouched: () => void = () => void 0;

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.label.set(value);
    this.onChange(value ? { label: value } : null);
  }

  writeValue(value: StructuredAddress | null): void {
    this.label.set(value?.label ?? '');
  }

  registerOnChange(fn: (value: StructuredAddress | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
