import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { Actions } from "modules/client/redux/actions";
import { store } from "modules/client/redux/store";
import { openMemoryMapInNewTab } from "../MemoryMapLibrary.utils";

describe("openMemoryMapInNewTab", () => {
  beforeEach(() => {
    store.dispatch(Actions.DashboardActions.setCurrentLibraryFilters(["WORKING COPY"]));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    store.dispatch(Actions.DashboardActions.setCurrentLibraryFilters([]));
  });

  it("opens the memory map in a new tab and clears library filters", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    openMemoryMapInNewTab({
      PartNumber: "305-0195-000",
      BOMRevision: " BBB ",
      InternalRevision: 4,
    });

    expect(openSpy).toHaveBeenCalledWith("/305-0195-000/BBB/4");
    expect(store.getState().Dashboard.currentLibraryFilters).toEqual([]);
  });

  it("does nothing when required row values are missing", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    openMemoryMapInNewTab({
      PartNumber: "305-0195-000",
      BOMRevision: "BBB",
    });

    expect(openSpy).not.toHaveBeenCalled();
    expect(store.getState().Dashboard.currentLibraryFilters).toEqual(["WORKING COPY"]);
  });
});
