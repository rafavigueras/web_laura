export function pickPaymentLink(now, config) {
  const time = now.getTime();
  const start = new Date(config.promoStartUtc).getTime();
  const end = new Date(config.promoEndUtc).getTime();
  return time >= start && time <= end ? config.promoUrl : config.normalUrl;
}
