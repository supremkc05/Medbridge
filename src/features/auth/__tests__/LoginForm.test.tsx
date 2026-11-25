import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "../LoginForm";

const push = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
jest.mock("next/image", () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

describe("LoginForm", () => {
  beforeEach(() => push.mockClear());

  it("toggles password visibility", async () => {
    render(<LoginForm />);
    const password = screen.getByLabelText("Password");
    expect(password).toHaveAttribute("type", "password");
    await userEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(password).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Hide password" })).toHaveAttribute("aria-pressed", "true");
  });

  it("asks for a valid email before signing in", async () => {
    render(<LoginForm />);
    const email = screen.getByLabelText("Work email");
    await userEvent.clear(email);
    await userEvent.type(email, "alex");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(screen.getByRole("alert")).toHaveTextContent("Enter your work email and password.");
    expect(push).not.toHaveBeenCalled();
  });

  it("signs in and shows progress", async () => {
    render(<LoginForm />);
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(push).toHaveBeenCalledWith("/dashboard");
    expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();
  });
});
