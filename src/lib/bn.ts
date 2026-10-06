export function toBn(input: number | string): string {
  const map = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(input).replace(/\d/g, (d) => map[Number(d)] ?? d);
}

export function bnPrice(value: number): string {
  return `৳ ${toBn(value.toLocaleString("en-US"))}`;
}
