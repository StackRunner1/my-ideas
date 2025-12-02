/**
 * Tests for StyleGuide page
 */

import { describe, it, expect } from "vitest";
import { renderWithProviders, screen } from "../../test/utils";
import StyleGuide from "../StyleGuide";

describe("StyleGuide Page", () => {
  it("renders the page title", () => {
    renderWithProviders(<StyleGuide />);
    expect(screen.getByText("Design System")).toBeInTheDocument();
  });

  it("renders all tab triggers", () => {
    renderWithProviders(<StyleGuide />);

    expect(screen.getByText("Colors")).toBeInTheDocument();
    expect(screen.getByText("Typography")).toBeInTheDocument();
    expect(screen.getByText("Spacing")).toBeInTheDocument();
    expect(screen.getByText("Components")).toBeInTheDocument();
  });

  it("renders Back to Home button", () => {
    renderWithProviders(<StyleGuide />);
    expect(screen.getByText("Back to Home")).toBeInTheDocument();
  });

  it("displays color swatches in Colors tab", () => {
    renderWithProviders(<StyleGuide />);

    // Colors tab should be default
    expect(screen.getByText("Color Palette")).toBeInTheDocument();
    expect(screen.getByText("Background")).toBeInTheDocument();
    expect(screen.getByText("Primary")).toBeInTheDocument();
  });
});
