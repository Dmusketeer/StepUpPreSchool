import { describe, expect, it } from "vitest";
import { getAppRoute } from "./routes.js";

describe("getAppRoute", () => {
  it("returns admin route", () => {
    expect(getAppRoute("/admin")).toBe("admin");
    expect(getAppRoute("/admin/settings")).toBe("admin");
  });

  it("returns portal route", () => {
    expect(getAppRoute("/portal")).toBe("portal");
    expect(getAppRoute("/portal?role=parent")).toBe("portal");
  });

  it("returns erp route", () => {
    expect(getAppRoute("/erp")).toBe("erp");
    expect(getAppRoute("/erp/modules")).toBe("erp");
  });

  it("falls back to public route", () => {
    expect(getAppRoute("/")).toBe("public");
    expect(getAppRoute("/about")).toBe("public");
  });
});
