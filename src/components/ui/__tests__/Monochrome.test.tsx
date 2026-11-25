import { render, screen } from "@testing-library/react";
import { Avatar } from "../Avatar";
import { Badge } from "../Badge";
import { DataTable } from "../DataTable";

type Row = { id: string; name: string; amount: string };

describe("monochrome tables", () => {
  it("renders badges and avatars in the single-ink style inside a table", () => {
    render(
      <DataTable<Row>
        caption="Invoices"
        rows={[{ id: "1", name: "Mia Bennett", amount: "$120.00" }]}
        rowKey={(r) => r.id}
        columns={[
          { key: "name", header: "Patient", render: (r) => <Avatar name={r.name} /> },
          { key: "amount", header: "Amount", align: "right", render: (r) => r.amount },
          { key: "status", header: "Status", render: () => <Badge tone="danger">Overdue</Badge> },
        ]}
      />,
    );
    expect(screen.getByText("Overdue").className).toMatch(/mono/);
    expect(screen.getByText("MB").className).toMatch(/mono/);
    expect(screen.getByText("$120.00").closest("td")?.className).toMatch(/numeric/);
  });

  it("keeps the coloured tones outside tables", () => {
    render(<Badge tone="danger">Overdue</Badge>);
    expect(screen.getByText("Overdue").className).toMatch(/danger/);
    expect(screen.getByText("Overdue").className).not.toMatch(/mono/);
  });
});
