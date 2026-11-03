void (() => {
  const date = new Date();
  console.info(`Locale DateTime: ${date.toLocaleString()}`);
  console.info(`ISO DateTime: ${date.toISOString()}`);
  console.info(`TimeZone Offset: ${date.getTimezoneOffset() / 60}`);
})();
