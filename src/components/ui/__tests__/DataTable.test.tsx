import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable, type Column } from "@/components/ui/DataTable";

type Row = { id: string; name: string };
const columns: Column<Row>[] = [
  { key: "name", header: "Name", sortable: true, render: (r) => r.name },
  { key: "id", header: "ID", render: (r) => r.id },
];
const rows = [
  { id: "1", name: "Ava" },
  { id: "2", name: "Liam" },
];

describe("DataTable", () => {
  it("renders a row per item", () => {
    render(<DataTable caption="People" columns={columns} rows={rows} rowKey={(r) => r.id} />);
    expect(screen.getByRole("table", { name: "People" })).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(3);
  });

  it("exposes the sort state and toggles the order", async () => {
    const onSortChange = jest.fn();
    render(
      <DataTable
        caption="People"
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        sort={{ key: "name", order: "asc" }}
        onSortChange={onSortChange}
      />,
    );
    expect(screen.getByRole("columnheader", { name: /name/i })).toHaveAttribute("aria-sort", "ascending");
    await userEvent.click(screen.getByRole("button", { name: /name/i }));
    expect(onSortChange).toHaveBeenCalledWith("name", "desc");
  });
});
