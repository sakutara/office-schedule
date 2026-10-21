import { describe, expect, it } from 'vitest';
import { getTranslations, formatMessage, SUPPORTED_LANGUAGES } from '../src/domains/i18n';
import { isBlankSwipeTarget, resolveNextTabIndex } from '../src/domains/navigation/swipeTabLogic';

describe('Bilingual i18n Domain (VI & EN)', () => {
  it('supports both vi and en with complete parity of keys', () => {
    expect(SUPPORTED_LANGUAGES).toEqual(['vi', 'en']);
    const vi = getTranslations('vi');
    const en = getTranslations('en');
    expect(Object.keys(vi).sort()).toEqual(Object.keys(en).sort());
    expect(vi.appTitle).toContain('Văn Phòng');
    expect(en.appTitle).toContain('Office');
  });

  it('interpolates dynamic placeholders accurately', () => {
    const msg = formatMessage('Cần lên {req}/{work} ngày ({pct}%)', {
      req: 8,
      work: 22,
      pct: 36,
    });
    expect(msg).toBe('Cần lên 8/22 ngày (36%)');
  });
});

describe('Swipe Bottom-Tab Navigation Logic', () => {
  it('identifies blank targets vs interactive elements', () => {
    expect(isBlankSwipeTarget(null)).toBe(true);
    expect(isBlankSwipeTarget({} as EventTarget)).toBe(true);

    const div = document.createElement('div');
    const btn = document.createElement('button');
    const spanInsideBtn = document.createElement('span');
    btn.appendChild(spanInsideBtn);
    div.appendChild(btn);

    expect(isBlankSwipeTarget(div)).toBe(true);
    expect(isBlankSwipeTarget(btn)).toBe(false);
    expect(isBlankSwipeTarget(spanInsideBtn)).toBe(false);
  });

  it('resolves next/previous tab on horizontal swipes and ignores short or vertical swipes', () => {
    // Single tab -> no change
    expect(resolveNextTabIndex(0, 1, { x: 200, y: 100 }, { x: 50, y: 100 })).toBe(0);

    // Short swipe -> no change
    expect(resolveNextTabIndex(0, 3, { x: 100, y: 100 }, { x: 80, y: 100 })).toBe(0);

    // Mostly vertical swipe -> no change
    expect(resolveNextTabIndex(0, 3, { x: 100, y: 100 }, { x: 30, y: 200 })).toBe(0);

    // Swipe left -> next tab
    expect(resolveNextTabIndex(0, 3, { x: 200, y: 100 }, { x: 100, y: 110 })).toBe(1);
    expect(resolveNextTabIndex(2, 3, { x: 200, y: 100 }, { x: 100, y: 110 })).toBe(2);

    // Swipe right -> previous tab
    expect(resolveNextTabIndex(2, 3, { x: 100, y: 100 }, { x: 200, y: 105 })).toBe(1);
    expect(resolveNextTabIndex(0, 3, { x: 100, y: 100 }, { x: 200, y: 105 })).toBe(0);
  });
});
