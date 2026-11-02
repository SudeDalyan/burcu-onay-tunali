globalThis.PropertyMath = {
  calculate(mode, price, second) {
    if (!Number.isFinite(price) || !Number.isFinite(second) || price <= 0 || second <= 0) return null;
    if (mode === 'sqm') return { unitPrice: price / second };
    return { annualRent: second * 12, yieldPercent: second * 12 / price * 100, paybackYears: price / (second * 12) };
  }
};
