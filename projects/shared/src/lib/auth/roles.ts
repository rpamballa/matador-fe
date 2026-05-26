/** Staff roles enforced at the backend controller level. */
export type StaffRole = 'ADMIN' | 'DISPATCHER' | 'SUPPORT' | 'READONLY';

/** End-user role. */
export type CustomerRole = 'CUSTOMER';

export type Role = StaffRole | CustomerRole;
