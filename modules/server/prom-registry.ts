import * as promClient from "prom-client";

type ConnectedUser = {
  socketId: string;
  browserName: string;
  operatingSystem: string;
  username: string;
};

type MetricsType = {
  usersConnected: ConnectedUser[];
  browsersConnected: {
    chrome: number;
    edge: number;
    ie: number;
    firefox: number;
    safari: number;
    other: number;
  };
  operatingSystemsConnected: {
    windows: number;
    mac: number;
    linux: number;
    unix: number;
  };
};

let metrics: MetricsType = {
  usersConnected: [],
  browsersConnected: {
    chrome: 0,
    edge: 0,
    ie: 0,
    firefox: 0,
    safari: 0,
    other: 0,
  },
  operatingSystemsConnected: {
    windows: 0,
    mac: 0,
    linux: 0,
    unix: 0,
  },
};

export function resetMetrics(): void {
  metrics = {
    usersConnected: [],
    browsersConnected: {
      chrome: 0,
      edge: 0,
      ie: 0,
      firefox: 0,
      safari: 0,
      other: 0,
    },
    operatingSystemsConnected: {
      windows: 0,
      mac: 0,
      linux: 0,
      unix: 0,
    },
  };

  // Reset all Prometheus metrics
  httpConnectionCount.set(0);
  httpBrowserConnectionCount.labels("Chrome").set(0);
  httpBrowserConnectionCount.labels("Edge").set(0);
  httpBrowserConnectionCount.labels("IE").set(0);
  httpBrowserConnectionCount.labels("Firefox").set(0);
  httpBrowserConnectionCount.labels("Safari").set(0);
  httpBrowserConnectionCount.labels("Other").set(0);
  httpOperatingSystemConnectionCount.labels("Windows").set(0);
  httpOperatingSystemConnectionCount.labels("Mac").set(0);
  httpOperatingSystemConnectionCount.labels("Linux").set(0);
  httpOperatingSystemConnectionCount.labels("Unix").set(0);
}

let promRegistry = new promClient.Registry();

promRegistry.setDefaultLabels({
  app: "Ops Manager",
});

const httpConnectionCount = new promClient.Gauge({
  name: "http_connection_count_total",
  help: "Total count of Live Connections",
});

const httpBrowserConnectionCount = new promClient.Gauge({
  name: "http_browser_connection_count_total",
  help: "Total count of Live Connections per browser",
  labelNames: ["browser"],
});

const httpOperatingSystemConnectionCount = new promClient.Gauge({
  name: "http_os_connection_count_total",
  help: "Total count of Live Connections for each operating system",
  labelNames: ["os"],
});

promRegistry.registerMetric(httpConnectionCount);
promRegistry.registerMetric(httpBrowserConnectionCount);
promRegistry.registerMetric(httpOperatingSystemConnectionCount);

// Memory Map metrics
const memoryMapLoadTotal = new promClient.Counter({
  name: "memory_map_load_total",
  help: "Total number of memory map loads",
  labelNames: ["memory_map_name", "bom_revision", "version"],
});

const memoryMapLoadDuration = new promClient.Histogram({
  name: "memory_map_load_duration_milliseconds",
  help: "Time taken to load a memory map in milliseconds",
  labelNames: ["memory_map_name"],
  buckets: [100, 500, 1000, 2000, 5000, 10000],
});

const memoryMapReleaseTotal = new promClient.Counter({
  name: "memory_map_release_total",
  help: "Total number of memory map releases",
  labelNames: ["memory_map_name", "ec_number"],
});

const memoryMapReleaseToProductionTotal = new promClient.Counter({
  name: "memory_map_release_to_production_total",
  help: "Total number of memory maps released to production",
});

const memoryMapVersionCount = new promClient.Gauge({
  name: "memory_map_version_count",
  help: "Current number of versions for each memory map",
  labelNames: ["memory_map_name"],
});

promRegistry.registerMetric(memoryMapLoadTotal);
promRegistry.registerMetric(memoryMapLoadDuration);
promRegistry.registerMetric(memoryMapReleaseTotal);
promRegistry.registerMetric(memoryMapReleaseToProductionTotal);
promRegistry.registerMetric(memoryMapVersionCount);

// User Action metrics
const userLoginTotal = new promClient.Counter({
  name: "user_login_total",
  help: "Total number of user logins",
  labelNames: ["username", "browser", "os"],
});

const userLogoutTotal = new promClient.Counter({
  name: "user_logout_total",
  help: "Total number of user logouts",
  labelNames: ["username"],
});

const userActionTotal = new promClient.Counter({
  name: "user_action_total",
  help: "Total number of user actions",
  labelNames: ["username", "action", "resource"],
});

const userSettingsUpdateTotal = new promClient.Counter({
  name: "user_settings_update_total",
  help: "Total number of user settings updates",
  labelNames: ["username"],
});

const memoryMapActionDuration = new promClient.Histogram({
  name: "memory_map_action_duration_milliseconds",
  help: "Time taken for memory map actions in milliseconds",
  labelNames: ["action", "memory_map_name"],
  buckets: [100, 500, 1000, 2000, 5000, 10000, 30000],
});

promRegistry.registerMetric(userLoginTotal);
promRegistry.registerMetric(userLogoutTotal);
promRegistry.registerMetric(userActionTotal);
promRegistry.registerMetric(userSettingsUpdateTotal);
promRegistry.registerMetric(memoryMapActionDuration);

const errorTotal = new promClient.Counter({
  name: "errors_total",
  help: "Total number of errors logged by level",
  labelNames: ["level", "error_type"],
});

const errorInfo = new promClient.Gauge({
  name: "error_info",
  help: "Information about the last error occurrence",
  labelNames: ["level", "error_type", "message", "timestamp"],
});

promRegistry.registerMetric(errorTotal);
promRegistry.registerMetric(errorInfo);

promClient.collectDefaultMetrics({ register: promRegistry });

function updateMetricValue<T extends Record<string, number>>(
  metricsObject: T,
  key: keyof T,
  operation: "inc" | "dec"
): void {
  if (operation === "inc") {
    metricsObject[key]++;
  } else {
    metricsObject[key] = Math.max(0, metricsObject[key] - 1) as T[keyof T];
  }
}

/**
 * Update operating system connection metrics
 */
function handleOperatingSystemMetrics(os: string, opt: "inc" | "dec") {
  const osMap: Record<string, keyof typeof metrics.operatingSystemsConnected> = {
    Mac: "mac",
    Linux: "linux",
    Unix: "unix",
    Windows: "windows",
  };

  const key = osMap[os] ?? "windows";
  updateMetricValue(metrics.operatingSystemsConnected, key, opt);

  // Update all Prometheus labels
  httpOperatingSystemConnectionCount.labels("Windows").set(metrics.operatingSystemsConnected.windows);
  httpOperatingSystemConnectionCount.labels("Mac").set(metrics.operatingSystemsConnected.mac);
  httpOperatingSystemConnectionCount.labels("Linux").set(metrics.operatingSystemsConnected.linux);
  httpOperatingSystemConnectionCount.labels("Unix").set(metrics.operatingSystemsConnected.unix);
}

function handleBrowserMetrics(browser: string, opt: "inc" | "dec") {
  const browserMap: Record<string, keyof typeof metrics.browsersConnected> = {
    Chrome: "chrome",
    Edge: "edge",
    IE: "ie",
    Firefox: "firefox",
    Safari: "safari",
  };

  const key = browserMap[browser] ?? "other";
  updateMetricValue(metrics.browsersConnected, key, opt);

  // Update all Prometheus labels
  httpBrowserConnectionCount.labels("Chrome").set(metrics.browsersConnected.chrome);
  httpBrowserConnectionCount.labels("Edge").set(metrics.browsersConnected.edge);
  httpBrowserConnectionCount.labels("IE").set(metrics.browsersConnected.ie);
  httpBrowserConnectionCount.labels("Firefox").set(metrics.browsersConnected.firefox);
  httpBrowserConnectionCount.labels("Safari").set(metrics.browsersConnected.safari);
  httpBrowserConnectionCount.labels("Other").set(metrics.browsersConnected.other);
}

function handleClientConnect(
  socketId: string,
  browserName: string,
  operatingSystem: string,
  username: string
): ConnectedUser | undefined {
  const userIsConnected = metrics.usersConnected.some((user) => socketId === user.socketId);
  if (!userIsConnected) {
    const user: ConnectedUser = {
      socketId: socketId,
      browserName: browserName,
      operatingSystem: operatingSystem,
      username: username,
    };
    metrics.usersConnected.push(user);
    httpConnectionCount.set(metrics.usersConnected.length);
    handleBrowserMetrics(browserName, "inc");
    handleOperatingSystemMetrics(operatingSystem, "inc");
    return user;
  }
}

function handleClientDisconnect(socketId: string): ConnectedUser | undefined {
  const foundUserIndex = metrics.usersConnected.findIndex((x) => x.socketId === socketId);
  if (foundUserIndex > -1) {
    const foundUser = { ...metrics.usersConnected[foundUserIndex] };
    metrics.usersConnected.splice(foundUserIndex, 1);
    httpConnectionCount.set(metrics.usersConnected.length);
    handleBrowserMetrics(foundUser.browserName, "dec");
    handleOperatingSystemMetrics(foundUser.operatingSystem, "dec");
    return foundUser;
  }
}

function trackMemoryMapLoad(memoryMapName: string, bomRevision: string, version: number) {
  memoryMapLoadTotal.labels(memoryMapName, bomRevision, version.toString()).inc();
}

function startMemoryMapLoadTimer(memoryMapName: string) {
  return memoryMapLoadDuration.startTimer({ memory_map_name: memoryMapName });
}

function trackMemoryMapRelease(memoryMapName: string, ecNumber: string) {
  memoryMapReleaseTotal.labels(memoryMapName, ecNumber).inc();
}

function trackMemoryMapReleaseToProduction() {
  memoryMapReleaseToProductionTotal.inc();
}

function updateMemoryMapVersionCount(memoryMapName: string, versionCount: number) {
  memoryMapVersionCount.labels(memoryMapName).set(versionCount);
}

/**
 * Track user login events
 */
function trackUserLogin(username: string, browser: string, os: string) {
  userLoginTotal.labels(username, browser, os).inc();
}

/**
 * Track user logout events
 */
function trackUserLogout(username: string) {
  userLogoutTotal.labels(username).inc();
}

/**
 * Track general user actions
 * @param username - User performing the action
 * @param action - Action type (e.g., "view", "edit", "delete", "save", "export")
 * @param resource - Resource being acted upon (e.g., "memory_map", "command_set", "settings")
 * @param resourceName - Optional name of the specific resource (e.g., command set name)
 */
function trackUserAction(username: string, action: string, resource: string) {
  userActionTotal.labels(username, action, resource).inc();
}

/**
 * Track user settings updates
 */
function trackUserSettingsUpdate(username: string) {
  userSettingsUpdateTotal.labels(username).inc();
}

/**
 * Start timer for memory map actions (edit, save, export, etc.)
 */
function startMemoryMapActionTimer(action: string, memoryMapName: string) {
  return memoryMapActionDuration.startTimer({ action, memory_map_name: memoryMapName });
}

/**
 * Track errors with Prometheus metrics
 * @param level - Error level: "error", "warning", or "critical"
 * @param errorType - Type of error (defaults to "unknown")
 * @param message - Error message (defaults to empty string)
 */
function trackError(level: string, errorType = "unknown", message = "") {
  errorTotal.labels(level, errorType).inc();
  errorInfo.labels(level, errorType, message, new Date().toISOString()).set(1);
}

export {
  promRegistry,
  handleClientConnect,
  handleClientDisconnect,
  trackMemoryMapLoad,
  startMemoryMapLoadTimer,
  trackMemoryMapRelease,
  trackMemoryMapReleaseToProduction,
  updateMemoryMapVersionCount,
  trackUserLogin,
  trackUserLogout,
  trackUserAction,
  trackUserSettingsUpdate,
  startMemoryMapActionTimer,
  trackError,
};
