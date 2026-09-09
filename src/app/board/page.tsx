import { notFound } from "next/navigation";
import BoardClient from "./BoardClient";

export const dynamic = "force-dynamic";

export default function BoardPage() {
  if (process.env.NODE_ENV !== "development" && process.env.ENABLE_DEV_BOARD !== "true") {
    notFound();
  }

  return <BoardClient />;
}
