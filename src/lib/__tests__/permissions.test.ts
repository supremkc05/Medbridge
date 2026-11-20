import { can } from "@/lib/permissions";

describe("can", () => {
  it("only lets managers manage staff and settings", () => {
    expect(can("manager", "staff:manage")).toBe(true);
    expect(can("front_desk", "staff:manage")).toBe(false);
    expect(can("doctor", "settings:edit")).toBe(false);
  });

  it("hides billing from doctors", () => {
    expect(can("billing", "billing:view")).toBe(true);
    expect(can("doctor", "billing:view")).toBe(false);
  });

  it("lets front desk register patients", () => {
    expect(can("front_desk", "patients:create")).toBe(true);
    expect(can("billing", "patients:create")).toBe(false);
  });
});
