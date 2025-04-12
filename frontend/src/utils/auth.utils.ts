export const hasAccess = (role: string, page: string): boolean => {
  const accessMap: Record<string, string[]> = {
    regular: ['PromotionsPage', 'EventsPage'],
    cashier: ['PromotionsPage', 'EventsPage'],
    manager: ['UsersPage', 'PromotionsPage', 'EventsPage'],
    superuser: ['UsersPage', 'PromotionsPage', 'EventsPage'],
  };

  return accessMap[role]?.includes(page) || false;
};