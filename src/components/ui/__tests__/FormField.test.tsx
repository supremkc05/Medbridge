import { render, screen } from "@testing-library/react";
import { TextField } from "@/components/ui/FormField";

describe("TextField", () => {
  it("links the error message to the input for screen readers", () => {
    render(<TextField id="email" label="Email" error="Enter a valid email address." defaultValue="x" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Enter a valid email address.");
  });

  it("shows the hint when there is no error", () => {
    render(<TextField id="phone" label="Phone" hint="10 digits" />);
    expect(screen.getByLabelText("Phone")).toHaveAccessibleDescription("10 digits");
    expect(screen.getByLabelText("Phone")).not.toHaveAttribute("aria-invalid");
  });
});
