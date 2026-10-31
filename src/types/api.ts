import type { components } from '@/types/generated/api';

/** Shorthand for a named contract schema. */
export type Schema<K extends keyof components['schemas']> = components['schemas'][K];

export type PageInfo = Schema<'PageInfo'>;
/** Keyset-paginated list: `?cursor=&limit=` in, `{ items, pageInfo }` out. */
export type Page<T> = { items: T[]; pageInfo: PageInfo };

export type Wallet = Schema<'Wallet'>;
export type UserSummary = Schema<'UserSummary'>;
export type Breakdown = Schema<'Breakdown'>;
export type RewardGrant = Schema<'RewardGrant'>;
export type Streak = Schema<'Streak'>;

export type Organization = Schema<'Organization'>;
export type MyOrganization = Schema<'MyOrganization'>;
export type CreateOrganizationBody = Schema<'CreateOrganizationBody'>;
export type UpdateOrganizationBody = Schema<'UpdateOrganizationBody'>;
export type OrganizationMemberList = Schema<'OrganizationMemberList'>;
export type OrganizationMember = Schema<'OrganizationMember'>;
export type AddOrganizationMemberBody = Schema<'AddOrganizationMemberBody'>;
export type JoinOrganizationBody = Schema<'JoinOrganizationBody'>;
export type JoinOrganizationResult = Schema<'JoinOrganizationResult'>;
export type ReviewOrganizationBody = Schema<'ReviewOrganizationBody'>;
