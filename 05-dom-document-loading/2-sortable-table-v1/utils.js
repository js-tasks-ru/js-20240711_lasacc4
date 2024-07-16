export const sortMethods = {
  string: (data, field, order) => {
    const options = {caseFirst: "upper"};

    return [...data].sort((a, b) => {
      return order === 'asc'
        ? a[field].localeCompare(b[field], ['ru', 'en'], options)
        : b[field].localeCompare(a[field], ['ru', 'en'], options);
    });
  },
  number: (data, field, order) => {
    return [...data].sort((a, b) => {
      return order === 'asc' ? a[field] - b[field] : b[field] - a[field];
    });
  }
};
