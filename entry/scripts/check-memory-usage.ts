const formatMemoryUsage = (data: number) => `${Math.round((data / 1024 / 1024) * 100) / 100} MB`;

void (async () => {
  const intervalId = setInterval(() => {
    const memoryData = process.memoryUsage();
    const usage = process.cpuUsage();
    const memoryUsage = {
      rss: `${formatMemoryUsage(
        memoryData.rss
      )} -> Resident Set Size - total memory allocated for the process execution`,
      heapTotal: `${formatMemoryUsage(memoryData.heapTotal)} -> total size of the allocated heap`,
      heapUsed: `${formatMemoryUsage(memoryData.heapUsed)} -> actual memory used during the execution`,
      external: `${formatMemoryUsage(memoryData.external)} -> V8 external memory`,
    };
    console.info(memoryUsage);
    console.info(usage);
  }, 1000);
  return () => clearInterval(intervalId);
})();
