import { describe, it, expect, beforeEach } from "vitest";
import * as promRegistry from "../prom-registry";

describe("Prometheus Metrics Output", () => {
  beforeEach(() => {
    promRegistry.resetMetrics();
  });

  it("should output user login metrics in prometheus format", async () => {
    promRegistry.trackUserLogin("john.doe", "Chrome", "Windows");
    promRegistry.trackUserLogin("jane.smith", "Firefox", "Mac");

    const metrics = await promRegistry.promRegistry.metrics();

    expect(metrics).toContain("user_login_total");
    expect(metrics).toContain('username="john.doe"');
    expect(metrics).toContain('browser="Chrome"');
    expect(metrics).toContain('os="Windows"');
  });

  it("should output connection count metrics", async () => {
    promRegistry.handleClientConnect("socket-1", "Chrome", "Windows", "user1");
    promRegistry.handleClientConnect("socket-2", "Firefox", "Mac", "user2");

    const metrics = await promRegistry.promRegistry.metrics();

    expect(metrics).toContain("http_connection_count_total");
    expect(metrics).toContain("http_browser_connection_count_total");
    expect(metrics).toContain("http_os_connection_count_total");
    expect(metrics).toContain('http_connection_count_total{app="Ops Manager"} 2');
  });

  it("should output memory map load metrics", async () => {
    promRegistry.trackMemoryMapLoad("305-1234-000", "AAA", 1);
    promRegistry.trackMemoryMapLoad("305-5678-000", "BBB", 2);

    const metrics = await promRegistry.promRegistry.metrics();

    expect(metrics).toContain("memory_map_load_total");
    expect(metrics).toContain('memory_map_name="305-1234-000"');
    expect(metrics).toContain('bom_revision="AAA"');
    expect(metrics).toContain('version="1"');
  });

  it("should output memory map version count gauge", async () => {
    promRegistry.updateMemoryMapVersionCount("305-1234-000", 5);
    promRegistry.updateMemoryMapVersionCount("305-5678-000", 3);

    const metrics = await promRegistry.promRegistry.metrics();

    expect(metrics).toContain("memory_map_version_count");
    expect(metrics).toContain('memory_map_name=\"305-1234-000\"');
    expect(metrics).toContain('memory_map_version_count{memory_map_name=\"305-1234-000\",app=\"Ops Manager\"} 5');
  });

  it("should output error tracking metrics", async () => {
    promRegistry.trackError("error", "ValidationError", "Invalid input provided");
    promRegistry.trackError("critical", "DatabaseError", "Connection failed");
    promRegistry.trackError("warning", "PerformanceWarning", "Slow query detected");

    const metrics = await promRegistry.promRegistry.metrics();

    expect(metrics).toContain("errors_total");
    expect(metrics).toContain("error_info");
    expect(metrics).toContain('level="error"');
    expect(metrics).toContain('error_type="ValidationError"');
    expect(metrics).toContain('level="critical"');
    expect(metrics).toContain('error_type="DatabaseError"');
    expect(metrics).toContain('level="warning"');
  });

  it("should output error info with message and timestamp", async () => {
    const errorMessage = "Database connection timeout after 30 seconds";
    promRegistry.trackError("error", "TimeoutError", errorMessage);

    const metrics = await promRegistry.promRegistry.metrics();

    expect(metrics).toContain("error_info");
    expect(metrics).toContain('message="Database connection timeout after 30 seconds"');
    expect(metrics).toContain("timestamp=");
    expect(metrics).toContain('error_type="TimeoutError"');
  });

  it("should output user action metrics", async () => {
    promRegistry.trackUserAction("john.doe", "view", "memory_map");
    promRegistry.trackUserAction("jane.smith", "edit", "command_set");
    promRegistry.trackUserAction("bob.jones", "save", "memory_map");

    const metrics = await promRegistry.promRegistry.metrics();

    expect(metrics).toContain("user_action_total");
    expect(metrics).toContain('action="view"');
    expect(metrics).toContain('resource="memory_map"');
    expect(metrics).toContain('action="edit"');
    expect(metrics).toContain('resource="command_set"');
  });

  it("should output user settings update metrics", async () => {
    promRegistry.trackUserSettingsUpdate("john.doe");
    promRegistry.trackUserSettingsUpdate("john.doe");

    const metrics = await promRegistry.promRegistry.metrics();

    expect(metrics).toContain("user_settings_update_total");
    expect(metrics).toContain('username="john.doe"');
  });

  it("should include default nodejs metrics", async () => {
    const metrics = await promRegistry.promRegistry.metrics();

    expect(metrics).toContain("process_cpu_user_seconds_total");
    expect(metrics).toContain("process_resident_memory_bytes");
    expect(metrics).toContain("nodejs_heap_size_used_bytes");
  });

  it("should include app label on all metrics", async () => {
    promRegistry.trackUserLogin("test.user", "Chrome", "Windows");

    const metrics = await promRegistry.promRegistry.metrics();

    const metricsLines = metrics.split("\n").filter((line) => line.startsWith("user_login_total"));
    expect(metricsLines.some((line) => line.includes('app="Ops Manager"'))).toBe(true);
  });

  it("should handle special characters in error messages", async () => {
    const messageWithSpecialChars = 'Error: "quotes" and \\backslash\\ and newline\ntest';
    promRegistry.trackError("error", "ParseError", messageWithSpecialChars);

    const metrics = await promRegistry.promRegistry.metrics();

    expect(metrics).toContain("error_info");
    expect(metrics).toContain("ParseError");
  });

  it("should track histogram buckets for memory map load duration", async () => {
    const endTimer = promRegistry.startMemoryMapLoadTimer("305-TEST-000");
    await new Promise((resolve) => setTimeout(resolve, 10));
    endTimer();

    const metrics = await promRegistry.promRegistry.metrics();

    expect(metrics).toContain("memory_map_load_duration_milliseconds");
    expect(metrics).toContain("memory_map_load_duration_milliseconds_bucket");
    expect(metrics).toContain("memory_map_load_duration_milliseconds_sum");
    expect(metrics).toContain("memory_map_load_duration_milliseconds_count");
  });

  it("should track histogram buckets for memory map actions", async () => {
    const endTimer = promRegistry.startMemoryMapActionTimer("save", "305-TEST-000");
    await new Promise((resolve) => setTimeout(resolve, 5));
    endTimer();

    const metrics = await promRegistry.promRegistry.metrics();

    expect(metrics).toContain("memory_map_action_duration_milliseconds");
    expect(metrics).toContain('action="save"');
    expect(metrics).toContain("memory_map_action_duration_milliseconds_bucket");
  });
});
