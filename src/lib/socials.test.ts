import { describe, expect, it } from 'vitest';
import { detectPlatform, shortHandle } from '@/lib/socials';

describe(detectPlatform, () => {
  it('matches a known platform by hostname', () => {
    expect(detectPlatform('https://letterboxd.com/taha').id).toBe('letterboxd');
    expect(detectPlatform('https://www.instagram.com/taha').id).toBe('instagram');
    expect(detectPlatform('https://x.com/taha').id).toBe('x');
    expect(detectPlatform('https://twitter.com/taha').id).toBe('x');
  });

  it('tolerates a missing protocol', () => {
    expect(detectPlatform('github.com/taha').id).toBe('github');
  });

  it('falls back to website for unknown hosts', () => {
    expect(detectPlatform('https://example.com').id).toBe('website');
    expect(detectPlatform('not a url').id).toBe('website');
  });
});

describe(shortHandle, () => {
  it('returns the last path segment as a handle', () => {
    expect(shortHandle('https://instagram.com/taha')).toBe('@taha');
    expect(shortHandle('https://letterboxd.com/@taha')).toBe('@taha');
  });

  it('falls back to the hostname for deep or empty paths', () => {
    expect(shortHandle('https://example.com')).toBe('example.com');
    expect(shortHandle('https://example.com/a/b/c')).toBe('example.com');
  });
});
