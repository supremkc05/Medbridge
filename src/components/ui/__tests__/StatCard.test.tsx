import { render, screen } from "@testing-library/react";
import { StatCard } from "../StatCard";

describe("StatCard", () => {
  it("shows the final number straight away when motion is not wanted", () => {
    render(<StatCard label="Appointments today" value={20} />);
    expect(screen.getByText("Appointments today")).toBeInTheDocument();
    expect(screen.getAllByText("20").length).toBeGreaterThan(0);
  });

  it("applies the formatter to numeric values", () => {
    render(<StatCard label="Collected" value={4740} format={(n) => `$${Math.round(n)}`} />);
    expect(screen.getAllByText("$4740").length).toBeGreaterThan(0);
  });

  it("marks the lead figure as featured", () => {
    const { container } = render(<StatCard featured label="Collected" value={10} />);
    expect(container.firstElementChild?.className).toMatch(/featured/);
  });

  it("renders non-numeric values as given", () => {
    render(<StatCard label="Total" value="–" />);
    expect(screen.getByText("–")).toBeInTheDocument();
  });
});
