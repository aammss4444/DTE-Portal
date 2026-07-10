export const ROLES = {
  ADMIN: 'ADMIN',
  PRINCIPAL: 'PRINCIPAL',
  RO: 'RO',
  TREASURY: 'TREASURY',
  FACULTY: 'FACULTY',
  CANDIDATE: 'CANDIDATE',
};

export const DASHBOARD_ROUTES = {
  [ROLES.ADMIN]: '/admin/dashboard',
  [ROLES.PRINCIPAL]: '/principal/dashboard',
  [ROLES.RO]: '/ro/dashboard',
  [ROLES.CANDIDATE]: '/candidate/dashboard',
  [ROLES.FACULTY]: '/faculty/dashboard',
  [ROLES.TREASURY]: '/treasury/dashboard',
};
