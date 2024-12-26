export const formatNumber = (num: number, threshold: number = 1_000_000) => {
  if (num >= 1_000_000_000 && num >= threshold) {
    const finalVal = num / 1_000_000;
    return `${finalVal.toLocaleString(navigator.language, { maximumFractionDigits: 0 })}M`;
  } else if (num >= 1_000_000 && num >= threshold) {
    const finalVal = num / 1_000;
    return `${finalVal.toLocaleString(navigator.language, { maximumFractionDigits: 0 })}K`;
  }
  return num.toLocaleString(navigator.language, { maximumFractionDigits: 0 });
};
