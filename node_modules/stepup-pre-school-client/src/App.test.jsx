import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./AdminPanel.jsx", () => ({
  default: () => <div>Admin Panel</div>
}));

vi.mock("./RolePortal.jsx", () => ({
  default: () => <div>Role Portal</div>
}));

vi.mock("./ErpReady.jsx", () => ({
  default: () => <div>ERP Ready</div>
}));

vi.mock("./PublicSite.jsx", () => ({
  default: () => <div>Public Site</div>
}));

vi.mock("./config/routes.js", () => ({
  getAppRoute: vi.fn()
}));

import App from "./App.jsx";
import { getAppRoute } from "./config/routes.js";

describe("App", () => {
  beforeEach(() => {
    getAppRoute.mockReset();
  });

  it("renders admin panel for admin route", () => {
    getAppRoute.mockReturnValue("admin");
    render(<App />);
    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
  });

  it("renders portal for portal route", () => {
    getAppRoute.mockReturnValue("portal");
    render(<App />);
    expect(screen.getByText("Role Portal")).toBeInTheDocument();
  });

  it("renders ERP page for erp route", () => {
    getAppRoute.mockReturnValue("erp");
    render(<App />);
    expect(screen.getByText("ERP Ready")).toBeInTheDocument();
  });

  it("renders public site by default", () => {
    getAppRoute.mockReturnValue("public");
    render(<App />);
    expect(screen.getByText("Public Site")).toBeInTheDocument();
  });
});
