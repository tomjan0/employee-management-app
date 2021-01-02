export const getDaysCount = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const getInitials = (base: string): string => {
  return base.split(' ').map(s => s.slice(0, 1)).join('');
};
