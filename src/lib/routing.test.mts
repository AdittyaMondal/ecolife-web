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

  it('rejects anything that is not a path, and absent values', () => {
    assert.equal(safeNextPath('evil.example'), null);
    assert.equal(safeNextPath('javascript:alert(1)'), null);
    assert.equal(safeNextPath(''), null);
    assert.equal(safeNextPath(null), null);
    assert.equal(safeNextPath(undefined), null);
  });
});
