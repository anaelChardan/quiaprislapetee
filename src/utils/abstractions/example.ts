// import {
//   type Organization,
//   type OrganizationPersistence,
//   OrganizationPersistenceSchema,
//   type MapperInterface,
//   type User,
//   type UserPersistence,
//   UserPersistenceSchema,
//   UserSchema,
//   OrganizationSchema,
//   type Assignment,
//   type AssignmentPersistence,
//   AssignmentPersistenceSchema,
//   AssignmentSchema,
//   type Submission,
//   type SubmissionPersistence,
//   SubmissionPersistenceSchema,
//   SubmissionSchema,
//   type NewsletterSubscription,
//   type NewsletterSubscriptionPersistence,
//   NewsletterSubscriptionPersistenceSchema,
//   NewsletterSubscriptionSchema,
//   type GroupPerDayUsage,
//   GroupPerDayUsageSchema,
//   type GroupPerDayUsagePersistence,
//   GroupPerDayUsagePersistenceSchema,
//   type OTP,
//   OTPSchema,
//   type OTPPersistence,
//   OTPPersistenceSchema,
// } from '@ok-wallace/contracts';
// import { ObjectId } from 'mongodb';
// import { createHash } from 'crypto';
// import { removeNullValues } from '@utils/remove-null-values';

// type Deps = {
//   loaders: ReturnType<typeof createLoaders>;
// };
// type UserMapper = MapperInterface<UserPersistence, User>;
// type OrganizationMapper = MapperInterface<OrganizationPersistence, Organization>;
// type AssignmentMapper = MapperInterface<AssignmentPersistence, Assignment>;
// type SubmissionMapper = MapperInterface<SubmissionPersistence, Submission>;
// type NewsletterSubscriptionMapper = MapperInterface<
//   NewsletterSubscriptionPersistence,
//   NewsletterSubscription
// >;
// type GroupPerDayUsageMapper = MapperInterface<GroupPerDayUsagePersistence, GroupPerDayUsage>;
// type OTPMapper = MapperInterface<OTPPersistence, OTP>;

// export const createMappers = ({
//   loaders,
// }: Deps): {
//   user: UserMapper;
//   organization: OrganizationMapper;
//   assignment: AssignmentMapper;
//   submission: SubmissionMapper;
//   newsletterSubscription: NewsletterSubscriptionMapper;
//   groupPerDayUsage: GroupPerDayUsageMapper;
//   otp: OTPMapper;
// } => {
//   const userMapper = {
//     toPersistence: async (user: User): Promise<UserPersistence> => {
//       const { id, ...rest } = user;
//       const clean = removeNullValues(rest);
//       return UserPersistenceSchema.parse({
//         ...clean,
//         _id: new ObjectId(id),
//       });
//     },
//     fromPersistence: async (user: UserPersistence): Promise<User> => {
//       const { _id, isApproved, ...rest } = user;
//       const clean = removeNullValues(rest);
//       return UserSchema.parse({
//         ...clean,
//         isApproved: !!isApproved,
//         avatar: `https://www.gravatar.com/avatar/${createHash('md5')
//           .update(user.email)
//           .digest('hex')}?d=identicon&s=128`,
//         id: _id.toString(),
//       });
//     },
//   };

//   const organizationMapper = {
//     toPersistence: async (org: Organization): Promise<OrganizationPersistence> => {
//       const { id, ...rest } = org;
//       const clean = removeNullValues(rest);
//       return OrganizationPersistenceSchema.parse({
//         ...clean,
//         _id: new ObjectId(id),
//       });
//     },
//     fromPersistence: async (org: OrganizationPersistence): Promise<Organization> => {
//       const { _id, ...rest } = org;
//       const clean = removeNullValues(rest);
//       return OrganizationSchema.parse({
//         ...clean,
//         id: _id.toString(),
//       });
//     },
//   };

//   const assignmentMapper = {
//     toPersistence: async (assignment: Assignment): Promise<AssignmentPersistence> => {
//       const { id, owner, ...rest } = assignment;
//       const clean = removeNullValues(rest);
//       return AssignmentPersistenceSchema.parse({
//         ...clean,
//         ownerId: new ObjectId(owner.id),
//         _id: new ObjectId(id),
//       });
//     },
//     fromPersistence: async (assignment: AssignmentPersistence): Promise<Assignment> => {
//       const { _id, ownerId, ...rest } = assignment;
//       const clean = removeNullValues(rest);
//       const owner = await loaders.users.load(ownerId.toString());
//       if (!owner) throw new Error('Owner not found');
//       return AssignmentSchema.parse({
//         ...clean,
//         subject: assignment?.subject || '',
//         difficulty: assignment?.difficulty || '',
//         owner: await userMapper.fromPersistence(owner),
//         id: _id.toString(),
//       });
//     },
//   };

//   const submissionMapper = {
//     toPersistence: async (submission: Submission): Promise<SubmissionPersistence> => {
//       const { id, owner, assignment, ...rest } = submission;
//       const clean = removeNullValues(rest);
//       return SubmissionPersistenceSchema.parse({
//         ...clean,
//         ownerId: new ObjectId(owner.id),
//         assignmentId: new ObjectId(assignment.id),
//         _id: new ObjectId(id),
//       });
//     },
//     fromPersistence: async (submission: SubmissionPersistence): Promise<Submission> => {
//       const { _id, ownerId, assignmentId, ...rest } = submission;
//       const clean = removeNullValues(rest);
//       const owner = await loaders.users.load(ownerId.toString());
//       const assignment = await loaders.assignments.load(assignmentId.toString());
//       if (!owner) throw new Error('Owner not found');
//       if (!assignment) throw new Error('Assignment not found');
//       return SubmissionSchema.parse({
//         ...clean,
//         owner: await userMapper.fromPersistence(owner),
//         assignment: await assignmentMapper.fromPersistence(assignment),
//         id: _id.toString(),
//       });
//     },
//   };

//   const newsletterSubscriptionMapper = {
//     toPersistence: async (
//       subscription: NewsletterSubscription,
//     ): Promise<NewsletterSubscriptionPersistence> => {
//       const { id, ...rest } = subscription;
//       const clean = removeNullValues(rest);
//       return NewsletterSubscriptionPersistenceSchema.parse({
//         ...clean,
//         _id: new ObjectId(id),
//       });
//     },
//     fromPersistence: async (
//       subscription: NewsletterSubscriptionPersistence,
//     ): Promise<NewsletterSubscription> => {
//       const { _id, ...rest } = subscription;
//       const clean = removeNullValues(rest);
//       return NewsletterSubscriptionSchema.parse({
//         ...clean,
//         id: _id.toString(),
//       });
//     },
//   };

//   const OTPMapper = {
//     toPersistence: async (otp: OTP): Promise<OTPPersistence> => {
//       const { id, ...rest } = otp;
//       const clean = removeNullValues(rest);
//       return OTPPersistenceSchema.parse({
//         ...clean,
//         _id: new ObjectId(id),
//       });
//     },
//     fromPersistence: async (otp: OTPPersistence): Promise<OTP> => {
//       const { _id, ...rest } = otp;
//       const clean = removeNullValues(rest);
//       return OTPSchema.parse({
//         ...clean,
//         id: _id.toString(),
//       });
//     },
//   };

//   const groupPerDayUsageMapper = {
//     toPersistence: async (usage: GroupPerDayUsage): Promise<GroupPerDayUsagePersistence> => {
//       const { id, ownerId, ...rest } = usage;
//       const clean = removeNullValues(rest);
//       return GroupPerDayUsagePersistenceSchema.parse({
//         ...clean,
//         _id: new ObjectId(id),
//         ownerId: new ObjectId(ownerId),
//       });
//     },
//     fromPersistence: async (usage: GroupPerDayUsagePersistence): Promise<GroupPerDayUsage> => {
//       const { _id, ownerId, ...rest } = usage;
//       const clean = removeNullValues(rest);
//       return GroupPerDayUsageSchema.parse({
//         ...clean,
//         id: _id.toString(),
//         ownerId: ownerId.toString(),
//       });
//     },
//   };

//   return {
//     user: userMapper,
//     organization: organizationMapper,
//     assignment: assignmentMapper,
//     submission: submissionMapper,
//     newsletterSubscription: newsletterSubscriptionMapper,
//     groupPerDayUsage: groupPerDayUsageMapper,
//     otp: OTPMapper,
//   };
// };
