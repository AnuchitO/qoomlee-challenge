import ReviewCheckInPageClient from "./ReviewCheckInPageClient";

export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ ref: "QM92Z4" }, { ref: "QM92Z5" }];
}

export default function ReviewCheckInPage() {
  return <ReviewCheckInPageClient />;
}
