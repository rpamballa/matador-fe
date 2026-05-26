import { MoneyPipe } from './money.pipe';

describe('MoneyPipe', () => {
  const pipe = new MoneyPipe();

  it('formats integer cents as USD', () => {
    expect(pipe.transform(12345)).toBe('$123.45');
  });

  it('formats a Money object', () => {
    expect(pipe.transform({ amount: 5000, currency: 'USD' })).toBe('$50.00');
  });

  it('returns empty string for null', () => {
    expect(pipe.transform(null)).toBe('');
  });
});
