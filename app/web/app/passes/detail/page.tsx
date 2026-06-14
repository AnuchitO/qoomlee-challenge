import { Suspense } from "react";
import BoardingPassPageClient from "./BoardingPassPageClient";
import { BoardingPassSkeleton } from "./_skeleton/BoardingPassSkeleton";

export default function BoardingPassPage() {
  return (
    <Suspense fallback={<BoardingPassSkeleton />}>
      <BoardingPassPageClient />
    </Suspense>
  );
}
