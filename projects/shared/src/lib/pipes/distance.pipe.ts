import { Pipe, PipeTransform } from '@angular/core';

/** Formats a distance given in meters as miles (US launch market). */
@Pipe({ name: 'distance', standalone: true })
export class DistancePipe implements PipeTransform {
  transform(meters: number | null | undefined, fractionDigits = 1): string {
    if (meters == null || meters < 0) {
      return '';
    }
    const miles = meters / 1609.344;
    return `${miles.toFixed(fractionDigits)} mi`;
  }
}
