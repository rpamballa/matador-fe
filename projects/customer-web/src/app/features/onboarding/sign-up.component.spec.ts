import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { SignUpComponent } from './sign-up.component';

describe('SignUpComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [SignUpComponent],
      providers: [provideHttpClient(), provideRouter([])],
    }),
  );

  it('rejects an under-21 date of birth', () => {
    const fixture = TestBed.createComponent(SignUpComponent);
    const dob = fixture.componentInstance.form.controls.dateOfBirth;
    const recent = new Date();
    recent.setFullYear(recent.getFullYear() - 18);
    dob.setValue(recent.toISOString().slice(0, 10));
    expect(dob.errors?.['minimumAge']).toBeTruthy();
  });

  it('accepts a 21+ date of birth', () => {
    const fixture = TestBed.createComponent(SignUpComponent);
    const dob = fixture.componentInstance.form.controls.dateOfBirth;
    dob.setValue('1990-01-01');
    expect(dob.errors).toBeNull();
  });
});
