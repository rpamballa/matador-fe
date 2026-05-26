import { DurationPipe } from './duration.pipe';
import { DistancePipe } from './distance.pipe';

describe('DurationPipe', () => {
  const pipe = new DurationPipe();

  it('formats days and hours', () => {
    expect(pipe.transform(2 * 24 * 60 + 3 * 60)).toBe('2d 3h');
  });

  it('formats minutes only', () => {
    expect(pipe.transform(45)).toBe('45m');
  });

  it('returns empty for null', () => {
    expect(pipe.transform(null)).toBe('');
  });
});

describe('DistancePipe', () => {
  const pipe = new DistancePipe();

  it('converts meters to miles', () => {
    expect(pipe.transform(1609.344)).toBe('1.0 mi');
  });

  it('returns empty for negative', () => {
    expect(pipe.transform(-1)).toBe('');
  });
});
