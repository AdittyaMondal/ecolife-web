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
export type OrganizationLookupResult = Schema<'OrganizationLookupResult'>;
export type RegenerateCodeResult = Schema<'RegenerateCodeResult'>;
export type OrganizationAnalytics = Schema<'OrganizationAnalytics'>;
export type OrgCategoryBreakdown = Schema<'OrgCategoryBreakdown'>;
export type OrgMonthlyTrendItem = Schema<'OrgMonthlyTrendItem'>;
export type UpdateMembershipPreferencesBody = Schema<'UpdateMembershipPreferencesBody'>;
export type UpdateMembershipPreferencesResult = Schema<'UpdateMembershipPreferencesResult'>;

export type OrgQuestionType = Schema<'OrgQuestionType'>;
export type OrgOnboardingQuestion = Schema<'OrgOnboardingQuestion'>;
export type CreateOrgQuestionBody = Schema<'CreateOrgQuestionBody'>;
export type UpdateOrgQuestionBody = Schema<'UpdateOrgQuestionBody'>;
export type ReorderOrgQuestionsBody = Schema<'ReorderOrgQuestionsBody'>;
export type OrgOnboardingStatus = Schema<'OrgOnboardingStatus'>;
export type OrgAnswerItem = Schema<'OrgAnswerItem'>;
export type OrgAnswerInput = Schema<'OrgAnswerInput'>;
export type SubmitOrgOnboardingAnswersBody = Schema<'SubmitOrgOnboardingAnswersBody'>;
export type OrgEmployeeAnswers = Schema<'OrgEmployeeAnswers'>;

export type {
  GardenInventoryItem,
  GardenState,
  GrowthStage,
  PlantedTree,
  Tree,
  TreeRarity,
} from './trees';

export type Product = Schema<'Product'>;
export type CreateSellerProductBody = Schema<'CreateSellerProductBody'>;
export type UpdateSellerProductBody = Partial<Schema<'UpdateSellerProductBody'>>;
export type SellerOrderItem = Schema<'SellerOrderItem'>;
export type SellerOrder = Schema<'SellerOrder'>;
export type UpdateSellerOrderStatusBody = Schema<'UpdateSellerOrderStatusBody'>;
export type SellerAnalytics = Schema<'SellerAnalytics'>;

export type SystemSettings = Schema<'SystemSettings'>;
export type UpdateSystemSettingsBody = Schema<'UpdateSystemSettingsBody'>;
export type SellerCommissionOverrideBody = Schema<'SellerCommissionOverrideBody'> & {
  reason?: string;
};
export type SellerCommissionOverride = Schema<'SellerCommissionOverride'>;
export type OrderSettlement = Schema<'OrderSettlement'>;
export type SellerPayout = Schema<'SellerPayout'>;
export type CreatePayoutBody = Schema<'CreatePayoutBody'>;
export type SettlementLedgerEntry = Schema<'SettlementLedgerEntry'>;
export type RevenueAnalytics = Schema<'RevenueAnalytics'>;
