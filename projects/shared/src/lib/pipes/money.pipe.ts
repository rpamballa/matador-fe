import { Pipe, PipeTransform } from '@angular/core';
import { Money } from '../models/money';

/** Formats integer minor units (or a Money object) as a localized currency string. */
@Pipe({ name: 'money', standalone: true })
export class MoneyPipe implements PipeTransform {
  transform(value: Money | number | null | undefined, currency = 'USD'): string {
    if (value == null) {
      return '';
    }
    const minorUnits = typeof value === 'number' ? value : value.amount;
    const code = typeof value === 'number' ? currency : value.currency;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
    }).format(minorUnits / 100);
  }
}
