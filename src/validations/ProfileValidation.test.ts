import { describe, expect, it } from 'vitest';
import { ProfileValidation } from './ProfileValidation';

describe('profile validation', () => {
  it('accepts an https website', () => {
    const result = ProfileValidation.safeParse({ website: 'https://example.com' });

    expect(result.success).toBeTruthy();
  });

  it('rejects a non-http scheme website', () => {
    const scriptUrl = ['javascript', 'alert(1)'].join(':');
    const result = ProfileValidation.safeParse({ website: scriptUrl });

    expect(result.success).toBeFalsy();
  });

  it('allows an empty website to clear the field', () => {
    const result = ProfileValidation.parse({ website: '' });

    expect(result.website).toBe('');
  });

  it('accepts an uppercase alpha-2 country code', () => {
    const result = ProfileValidation.safeParse({ country: 'TR' });

    expect(result.success).toBeTruthy();
  });

  it('rejects a non-letter country code', () => {
    const result = ProfileValidation.safeParse({ country: '12' });

    expect(result.success).toBeFalsy();
  });
});
