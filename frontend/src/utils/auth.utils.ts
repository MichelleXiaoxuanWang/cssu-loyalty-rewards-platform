export const hasAccess = (role: string, page: string): boolean => {
  const accessMap: Record<string, string[]> = {
    regular: ['PromotionsPage', 'EventsPage', 'TransactionsPage', 'LandingPage', 'CreateTransactionPage'],
    cashier: ['PromotionsPage', 'EventsPage', 'TransactionsPage', 'LandingPage', 'CreateUserPage', 'CreateTransactionPage'],
    manager: ['UsersPage', 'PromotionsPage', 'EventsPage', 'TransactionsPage', 'LandingPage', 'CreateUserPage', 'CreateTransactionPage'],
    superuser: ['UsersPage', 'PromotionsPage', 'EventsPage', 'TransactionsPage', 'LandingPage', 'CreateUserPage', 'CreateTransactionPage'],
  };

  return accessMap[role]?.includes(page) || false;
};