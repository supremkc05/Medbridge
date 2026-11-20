import { NextResponse } from "next/server";
import { db } from "@/server/db";

export function GET() {
  return NextResponse.json(db().doctors);
}
