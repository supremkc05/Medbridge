const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const moneyFmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function formatDate(iso: string | null | undefined, fallback = "—"): string {
  if (!iso) return fallback;
  return dateFmt.format(new Date(iso));
}

export function formatMoney(amount: number): string {
  return moneyFmt.format(amount);
}

export function ageFrom(dateOfBirth: string, today = new Date()): number {
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
