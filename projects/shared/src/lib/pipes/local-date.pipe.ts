import { Pipe, PipeTransform } from '@angular/core';

/** Formats an ISO instant in the customer's local timezone (America/New_York for launch). */
@Pipe({ name: 'localDate', standalone: true })
export class LocalDatePipe implements PipeTransform {
  transform(
    value: string | Date | null | undefined,
    style: 'short' | 'medium' | 'long' = 'medium',
  ): string {
    if (value == null) {
      return '';
    }
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    const options: Intl.DateTimeFormatOptions =
      style === 'short'
        ? { dateStyle: 'short' }
        : style === 'long'
          ? { dateStyle: 'long', timeStyle: 'short' }
          : { dateStyle: 'medium', timeStyle: 'short' };
    return new Intl.DateTimeFormat('en-US', {
      ...options,
      timeZone: 'America/New_York',
    }).format(date);
  }
}
