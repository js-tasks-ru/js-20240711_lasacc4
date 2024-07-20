export const borderValueNormalizer = {
  left: (props) => {
    const {value, min, selected} = props;
    const tempValue = Math.min(value, selected.to);
    return Math.max(tempValue, min);
  },
  right: (props) => {
    const {value, max, selected} = props;
    const tempValue = Math.max(value, selected.from);
    return Math.min(tempValue, max);
  },
};
