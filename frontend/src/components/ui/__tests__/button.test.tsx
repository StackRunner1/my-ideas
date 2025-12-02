/**
 * Tests for shadcn/ui Button component
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithProviders, screen } from "../../../test/utils";
import { Button } from "../button";

describe("Button Component", () => {
  it("renders with default variant", () => {
    renderWithProviders(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("renders with different variants", () => {
    const { rerender } = renderWithProviders(
      <Button variant="destructive">Delete</Button>
    );
    expect(screen.getByText("Delete")).toBeInTheDocument();

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByText("Outline")).toBeInTheDocument();

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByText("Ghost")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    renderWithProviders(<Button onClick={handleClick}>Click me</Button>);

    screen.getByText("Click me").click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    renderWithProviders(<Button disabled>Disabled</Button>);
    const button = screen.getByText("Disabled");
    expect(button).toBeDisabled();
  });
});
