import { fireEvent, render, screen } from "@testing-library/react";
import { MonthlyChart } from "../MonthlyChart";

const data = [
  { month: "2026-09", paid: 4000, outstanding: 500 },
  { month: "2026-10", paid: 1200, outstanding: 2800 },
];

describe("MonthlyChart", () => {
  it("labels every month for assistive technology", () => {
    render(<MonthlyChart data={data} />);
    expect(screen.getByRole("button", { name: /September 2026: \$4,000\.00 paid, \$500\.00 outstanding/ })).toBeInTheDocument();
  });

  it("shows a tooltip for the focused month and hides it on blur", () => {
    render(<MonthlyChart data={data} />);
    const october = screen.getByRole("button", { name: /October 2026/ });
    fireEvent.focus(october);
    expect(screen.getByRole("status")).toHaveTextContent("October 2026");
    expect(screen.getByRole("status")).toHaveTextContent("$2,800.00");
    fireEvent.blur(october);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
