import ChangeFlightPageClient from "./ChangeFlightPageClient";

export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ ref: "QL-88291" }, { ref: "QL-77150" }];
}

export default function ChangeFlightPage() {
  return <ChangeFlightPageClient />;
}
