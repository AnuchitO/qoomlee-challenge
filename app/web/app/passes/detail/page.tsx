import { Suspense } from "react";
import BoardingPassPageClient from "./BoardingPassPageClient";

export default function BoardingPassPage() {
  return (
    <Suspense>
      <BoardingPassPageClient />
    </Suspense>
  );
}
