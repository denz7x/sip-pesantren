import { requireAuth } from "@/lib/auth";
import { db } from "@/db";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import AbsensiClient from "./AbsensiClient";

export default async function UstadzAbsensiPage() {
  const session = await requireAuth(["USTADZ"]);

  // Fetch data from Google Sheets
  const santris = await db.select('santris');
  const absensis = await db.select('absensis');

  return (
    <DashboardLayout
      role="USTADZ"
      userName={session.name}
      userId={String(session.id)}
      pageTitle="Absensi Santri"
    >
      <AbsensiClient 
        santris={santris} 
        absensis={absensis} 
        ustadzId={session.id}
      />
    </DashboardLayout>
  );
}
