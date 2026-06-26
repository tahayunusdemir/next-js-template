import { describe, expect, it } from 'vitest';
import { CONTACT_MESSAGE_MAX, ContactValidation } from './LeadValidation';

const base = { email: 'a@b.com', subject: 'Hello', message: 'A real message' };

describe('contact validation', () => {
  it('accepts a well-formed message', () => {
    const result = ContactValidation.safeParse(base);

    expect(result.success).toBeTruthy();
  });

  it('rejects a whitespace-only message', () => {
    const result = ContactValidation.safeParse({ ...base, message: '   ' });

    expect(result.success).toBeFalsy();
  });

  it('rejects a message over the length cap', () => {
    const result = ContactValidation.safeParse({
      ...base,
      message: 'x'.repeat(CONTACT_MESSAGE_MAX + 1),
    });

    expect(result.success).toBeFalsy();
  });

  it('trims surrounding whitespace from the subject', () => {
    const result = ContactValidation.parse({ ...base, subject: '  Hi  ' });

    expect(result.subject).toBe('Hi');
  });
});
