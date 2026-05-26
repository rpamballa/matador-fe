import { Pipe, PipeTransform } from '@angular/core';

/** Formats a duration given in minutes as a compact human string, e.g. "2d 3h", "45m". */
@Pipe({ name: 'duration', standalone: true })
export class DurationPipe implements PipeTransform {
  transform(minutes: number | null | undefined): string {
    if (minutes == null || minutes < 0) {
      return '';
    }
    const total = Math.round(minutes);
    const days = Math.floor(total / (60 * 24));
    const hours = Math.floor((total % (60 * 24)) / 60);
    const mins = total % 60;

    const parts: string[] = [];
    if (days > 0) {
      parts.push(`${days}d`);
    }
    if (hours > 0) {
      parts.push(`${hours}h`);
    }
    if (mins > 0 || parts.length === 0) {
      parts.push(`${mins}m`);
    }
    return parts.join(' ');
  }
}
