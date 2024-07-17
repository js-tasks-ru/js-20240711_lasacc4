const sortTypes = {
  string: (firstValue, secondValue, order) => {
    const options = {caseFirst: "upper"};

    return order === 'asc'
      ? firstValue.localeCompare(secondValue, ['ru', 'en'], options)
      : secondValue.localeCompare(firstValue, ['ru', 'en'], options);
  },
  number: (firstValue, secondValue, order) => {
    return order === 'asc' ? firstValue - secondValue : secondValue - firstValue;
  },
};

export function sortByFields(data, fields, order) {
  return [...data].sort((a, b) => {
    let comparisonResult = 0;

    fields.forEach(field => {
      comparisonResult ||= sortTypes[field.type](a[field.value], b[field.value], order);
    });

    return comparisonResult;
  });
}
