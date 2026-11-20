import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { patientStats } from "@/server/patients";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(patientStats(db().patients));
}
