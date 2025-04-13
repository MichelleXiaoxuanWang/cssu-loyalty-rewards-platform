export const hasAccess = (role: string, page: string): boolean => {
  const accessMap: Record<string, string[]> = {
    regular: ['PromotionsPage', 'EventsPage', 'TransactionsPage', 'LandingPage'],
    cashier: ['PromotionsPage', 'EventsPage', 'TransactionsPage', 'LandingPage'],
    manager: ['UsersPage', 'PromotionsPage', 'EventsPage', 'TransactionsPage', 'LandingPage'],
    superuser: ['UsersPage', 'PromotionsPage', 'EventsPage', 'TransactionsPage', 'LandingPage'],
  };

  return accessMap[role]?.includes(page) || false;
};