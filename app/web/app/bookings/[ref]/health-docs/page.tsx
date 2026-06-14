import HealthDocumentsPageClient from "./HealthDocumentsPageClient";

export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ ref: "QL-88291" }, { ref: "QL-77150" }];
}

export default function HealthDocumentsPage() {
  return <HealthDocumentsPageClient />;
}
