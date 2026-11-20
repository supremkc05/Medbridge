import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination } from "@/components/ui/Pagination";

describe("Pagination", () => {
  it("summarises the visible range and disables Previous on the first page", () => {
    render(<Pagination page={1} pageSize={10} total={25} onPageChange={() => {}} itemLabel="patients" />);
    expect(screen.getByRole("navigation", { name: "Pagination" })).toHaveTextContent("Showing 1–10 of 25 patients");
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  });

  it("requests the next page", async () => {
    const onPageChange = jest.fn();
    render(<Pagination page={2} pageSize={10} total={25} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
