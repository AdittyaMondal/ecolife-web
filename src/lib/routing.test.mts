import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { landingPathFor, safeNextPath } from './routing.ts';

describe('landingPathFor (Part 1 Role-Based Routing)', () => {
  it('routes platform admin to /admin', () => {
    const path = landingPathFor({
      role: 'admin',
      onboardingComplete: true,
      completedSteps: 5,
    });
    assert.equal(path, '/admin');
  });

  it('routes Corporate Partner (industry) to Corporate Portal', () => {
    const path = landingPathFor({
      role: 'user',
      onboardingComplete: true,
      completedSteps: 5,
      organization: { type: 'industry', status: 'approved', role: 'owner' },
    });
    assert.equal(path, '/organization/corporate');
  });

  it('routes Community Partner (ngo) to Community Portal', () => {
    const path = landingPathFor({
      role: 'user',
      onboardingComplete: true,
      completedSteps: 5,
      organization: { type: 'ngo', status: 'pending', role: 'owner' },
    });
    assert.equal(path, '/organization/community');
  });

  it('routes Marketplace Partner (seller) to Seller Portal', () => {
    const path = landingPathFor({
      role: 'user',
      onboardingComplete: true,
      completedSteps: 5,
      organization: { type: 'seller', status: 'approved', role: 'member' },
    });
    assert.equal(path, '/marketplace/seller');
  });

  it('routes individual user with completed onboarding to /home', () => {
    const path = landingPathFor({
      role: 'user',
      onboardingComplete: true,
      completedSteps: 5,
      organization: null,
    });
    assert.equal(path, '/home');
  });

  it('routes uncompleted individual user to their next onboarding step', () => {
    const path = landingPathFor({
      role: 'user',
      onboardingComplete: false,
      completedSteps: 2,
      organization: null,
    });
    assert.equal(path, '/step/3');
  });
});

describe('safeNextPath (open-redirect guard on ?next=)', () => {
  it('accepts a same-site path, with query and hash', () => {
    assert.equal(safeNextPath('/track'), '/track');
    assert.equal(safeNextPath('/marketplace/orders?page=2'), '/marketplace/orders?page=2');
    assert.equal(safeNextPath('/step/3#top'), '/step/3#top');
  });

  it('rejects an absolute URL — the phishing case', () => {
    assert.equal(safeNextPath('https://evil.example'), null);
    assert.equal(safeNextPath('http://evil.example/home'), null);
  });

  it('rejects a protocol-relative URL, which also leaves the site', () => {
    assert.equal(safeNextPath('//evil.example'), null);
    assert.equal(safeNextPath('//evil.example/home'), null);
  });

  it('rejects a backslash form, which some agents normalise to //', () => {
    assert.equal(safeNextPath('/\\evil.example'), null);
  });

  it('rejects control characters browsers STRIP before parsing', () => {
    // These start with a single slash and contain no `//`, so a prefix guard
    // waves them through — and they resolve to https://evil.example, because
    // the URL spec removes tab, LF and CR from the input first.
    assert.equal(safeNextPath('/\t/evil.example'), null);
    assert.equal(safeNextPath('/\n/evil.example'), null);
    assert.equal(safeNextPath('/\r/evil.example'), null);
    assert.equal(safeNextPath('/\t\t//evil.example'), null);
  });

  it('returns the re-serialised path, so caller and check cannot diverge', () => {
    // Whatever survives is what the browser would have navigated to anyway.
    assert.equal(safeNextPath('/track/../home'), '/home');
    assert.equal(safeNextPath('/track?a=1#b'), '/track?a=1#b');
  });

  it('rejects anything that is not a path, and absent values', () => {
    assert.equal(safeNextPath('evil.example'), null);
    assert.equal(safeNextPath('javascript:alert(1)'), null);
    assert.equal(safeNextPath(''), null);
    assert.equal(safeNextPath(null), null);
    assert.equal(safeNextPath(undefined), null);
  });
});

describe('safeNextPath returns a value that is itself safe', () => {
  it('collapses a pathname that normalises to protocol-relative', () => {
    // These resolve SAME-ORIGIN, so an origin check alone passes them — and
    // then the returned pathname is `//evil.example`, which goes off-site the
    // moment it is navigated. Checking the input is not enough; the output is
    // what the caller uses.
    assert.equal(safeNextPath('/.//evil.example'), '/evil.example');
    assert.equal(safeNextPath('/a/..//evil.example'), '/evil.example');
    assert.equal(safeNextPath('/%2e//evil.example'), '/evil.example');
  });

  it('never returns a value with more than one leading slash', () => {
    for (const raw of [
      '/.//evil.example',
      '/a/..//evil.example',
      '/%2e//evil.example',
      '/./././/x',
      '/track',
      '/track?a=1#b',
    ]) {
      const out = safeNextPath(raw);
      if (out === null) continue;
      assert.ok(out.startsWith('/'), `${raw} -> ${out}`);
      assert.ok(!out.startsWith('//'), `${raw} -> ${out} is protocol-relative`);
    }
  });
});
