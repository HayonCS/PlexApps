/**
 * Browser and OS detection utilities for WebSocket metrics
 */

export function getBrowserName(): string {
  const userAgent = navigator.userAgent;

  if (userAgent.includes("Firefox")) {
    return "Firefox";
  } else if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
    return "Chrome";
  } else if (userAgent.includes("Edg")) {
    return "Edge";
  } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    return "Safari";
  } else if (userAgent.includes("MSIE") || userAgent.includes("Trident")) {
    return "IE";
  }

  return "Other";
}

export function getOperatingSystem(): string {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;

  if (platform.includes("Win") || userAgent.includes("Windows")) {
    return "Windows";
  } else if (platform.includes("Mac") || userAgent.includes("Macintosh")) {
    return "Mac";
  } else if (platform.includes("Linux") || userAgent.includes("Linux")) {
    return "Linux";
  } else if (platform.includes("X11")) {
    return "Unix";
  }

  return "Unknown";
}
