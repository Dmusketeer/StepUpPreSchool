import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./ThreePlayBackground.jsx", () => ({
  default: () => null
}));

import { Gallery } from "./PublicSite.jsx";
import { galleryPreviewCount } from "./public/publicConfig.js";

const categories = ["Classroom", "Events"];

function createItems(total) {
  return Array.from({ length: total }, (_, index) => ({
    id: `item-${index}`,
    type: "image",
    src: `https://example.test/${index}.jpg`,
    title: `Moment ${index + 1}`,
    alt: `Moment ${index + 1}`,
    category: index % 2 === 0 ? "Classroom" : "Events"
  }));
}

function renderGallery(total, onOpenViewer = vi.fn()) {
  render(<Gallery items={createItems(total)} categories={categories} onOpenViewer={onOpenViewer} />);
  return onOpenViewer;
}

function tileCount() {
  return screen.getAllByRole("button", { name: /^View Moment/ }).length;
}

describe("Gallery", () => {
  it("renders every item when the total is within the preview limit", () => {
    renderGallery(galleryPreviewCount);

    expect(tileCount()).toBe(galleryPreviewCount);
    expect(screen.queryByRole("button", { name: /more$/ })).not.toBeInTheDocument();
  });

  it("limits the grid to the preview count and offers the remaining items", () => {
    renderGallery(12);

    expect(tileCount()).toBe(galleryPreviewCount);
    expect(screen.getByText(`Showing ${galleryPreviewCount} of 12`)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View 7 more" })).toHaveAttribute("aria-expanded", "false");
  });

  it("expands to all items and collapses back", () => {
    renderGallery(12);

    fireEvent.click(screen.getByRole("button", { name: "View 7 more" }));

    expect(tileCount()).toBe(12);
    expect(screen.getByText("Showing 12 of 12")).toBeInTheDocument();
    const collapseButton = screen.getByRole("button", { name: "Show less" });
    expect(collapseButton).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(collapseButton);

    expect(tileCount()).toBe(galleryPreviewCount);
    expect(screen.getByRole("button", { name: "View 7 more" })).toBeInTheDocument();
  });

  it("collapses again when the category changes", () => {
    renderGallery(12);

    fireEvent.click(screen.getByRole("button", { name: "View 7 more" }));
    expect(tileCount()).toBe(12);

    fireEvent.click(screen.getByRole("button", { name: /^Classroom/ }));
    fireEvent.click(screen.getByRole("button", { name: /^All/ }));

    expect(tileCount()).toBe(galleryPreviewCount);
  });

  it("counts items per category and hides categories with no items", () => {
    render(
      <Gallery
        items={createItems(4)}
        categories={[...categories, "Celebrations"]}
        onOpenViewer={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: /^All/ })).toHaveTextContent("4");
    expect(screen.getByRole("button", { name: /^Classroom/ })).toHaveTextContent("2");
    expect(screen.queryByRole("button", { name: /^Celebrations/ })).not.toBeInTheDocument();
  });

  it("filters tiles down to the active category", () => {
    renderGallery(12);

    fireEvent.click(screen.getByRole("button", { name: /^Events/ }));

    expect(tileCount()).toBe(galleryPreviewCount);
    expect(screen.getByText(`Showing ${galleryPreviewCount} of 6`)).toBeInTheDocument();
  });

  it("opens the viewer with every item in the category so hidden items stay reachable", () => {
    const onOpenViewer = renderGallery(12);

    fireEvent.click(screen.getByRole("button", { name: "View Moment 3" }));

    const [viewerItems, index] = onOpenViewer.mock.calls[0];
    expect(viewerItems).toHaveLength(12);
    expect(index).toBe(2);
    expect(viewerItems[index].title).toBe("Moment 3");
  });

  it("shows an empty state when a gallery has no items", () => {
    render(<Gallery items={[]} categories={categories} onOpenViewer={vi.fn()} />);

    expect(screen.getByText(/No photos or videos in this category yet/)).toBeInTheDocument();
  });
});
