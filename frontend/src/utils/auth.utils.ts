export const hasAccess = (role: string, page: string): boolean => {
  const accessMap: Record<string, string[]> = {
    regular: ['PromotionsPage', 'EventsPage', 'TransactionsPage'],
    cashier: ['PromotionsPage', 'EventsPage', 'TransactionsPage'],
    manager: ['UsersPage', 'PromotionsPage', 'EventsPage', 'TransactionsPage'],
    superuser: ['UsersPage', 'PromotionsPage', 'EventsPage', 'TransactionsPage'],
  };

  return accessMap[role]?.includes(page) || false;
};