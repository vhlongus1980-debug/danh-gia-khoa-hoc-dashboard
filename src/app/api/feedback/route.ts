import { NextResponse } from "next/server";
import initialData from "@/data/initialData.json";

export async function GET() {
  return NextResponse.json({
    source: "DANH GIA KHOA HOC (Responses).xlsx",
    count: initialData.length,
    records: initialData,
  });
}
