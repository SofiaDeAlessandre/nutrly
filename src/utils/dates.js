import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, subDays, addWeeks, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';

export const today = () => format(new Date(), 'yyyy-MM-dd');
export const currentMonth = () => format(new Date(), 'yyyy-MM');

export const formatDate = (dateStr) => {
  const d = new Date(dateStr + 'T12:00:00');
  return format(d, "EEEE d 'de' MMMM", { locale: es });
};

export const formatDateShort = (dateStr) => {
  const d = new Date(dateStr + 'T12:00:00');
  return format(d, "d MMM", { locale: es });
};

export const formatMonth = (monthStr) => {
  const d = new Date(monthStr + '-01T12:00:00');
  return format(d, "MMMM yyyy", { locale: es });
};

export const getWeekRange = (dateStr) => {
  const d = new Date(dateStr + 'T12:00:00');
  const start = startOfWeek(d, { weekStartsOn: 1 });
  const end = endOfWeek(d, { weekStartsOn: 1 });
  return {
    from: format(start, 'yyyy-MM-dd'),
    to: format(end, 'yyyy-MM-dd'),
    label: `${format(start, "d MMM", { locale: es })} – ${format(end, "d MMM", { locale: es })}`,
  };
};

export const getMonthRange = (monthStr) => {
  const d = new Date(monthStr + '-01T12:00:00');
  return {
    from: format(startOfMonth(d), 'yyyy-MM-dd'),
    to: format(endOfMonth(d), 'yyyy-MM-dd'),
  };
};

export const prevDay = (dateStr) => format(subDays(new Date(dateStr + 'T12:00:00'), 1), 'yyyy-MM-dd');
export const nextDay = (dateStr) => format(addDays(new Date(dateStr + 'T12:00:00'), 1), 'yyyy-MM-dd');

export const prevWeek = (dateStr) => format(subWeeks(new Date(dateStr + 'T12:00:00'), 1), 'yyyy-MM-dd');
export const nextWeek = (dateStr) => format(addWeeks(new Date(dateStr + 'T12:00:00'), 1), 'yyyy-MM-dd');

export const prevMonth = (monthStr) => {
  const [y, m] = monthStr.split('-').map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
};

export const nextMonth = (monthStr) => {
  const [y, m] = monthStr.split('-').map(Number);
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
};

export const isToday = (dateStr) => dateStr === today();
export const isFuture = (dateStr) => dateStr > today();
