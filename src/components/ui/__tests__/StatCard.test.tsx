import { render, screen } from "@testing-library/react";
import { StatCard } from "../StatCard";

describe("StatCard", () => {
  it("shows the final number straight away when motion is not wanted", () => {
    render(<StatCard label="Appointments today" value={20} icon={null} />);
    expect(screen.getByText("Appointments today")).toBeInTheDocument();
    expect(screen.getAllByText("20").length).toBeGreaterThan(0);
  });

  it("applies the formatter to numeric values", () => {
    render(<StatCard label="Collected" value={4740} format={(n) => `$${Math.round(n)}`} icon={null} />);
    expect(screen.getAllByText("$4740").length).toBeGreaterThan(0);
  });

  it("renders non-numeric values as given", () => {
    render(<StatCard label="Total" value="–" icon={null} />);
    expect(screen.getByText("–")).toBeInTheDocument();
  });
});
