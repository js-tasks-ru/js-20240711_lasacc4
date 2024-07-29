const getUtcDate = (date1) => {
  return Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
};

export const dateComparer = {
  isSameDay: (date1, date2) => {
    const date1UTC = getUtcDate(date1);
    const date2UTC = getUtcDate(date2);

    return date1UTC === date2UTC;
  },
  isBetweenDates: (from, to, comparedDate) => {
    const fromUTC = getUtcDate(from);
    const toUtc = getUtcDate(to);
    const comparedDateUTC = getUtcDate(comparedDate);

    return comparedDateUTC > fromUTC && comparedDateUTC < toUtc;
  },
  isFirstValueLess: (from, to) => {
    const fromUTC = getUtcDate(from);
    const toUtc = getUtcDate(to);

    return fromUTC < toUtc;
  }
};
