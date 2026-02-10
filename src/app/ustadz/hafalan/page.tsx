import { requireAuth } from "@/lib/auth";
import { db } from "@/db";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import HafalanClient from "./HafalanClient";

export default async function UstadzHafalanPage() {
  const session = await requireAuth(["USTADZ"]);

  // Fetch data from Google Sheets
  const santris = await db.select('santris');
  const hafalans = await db.select('setoranHafalans');

  return (
    <DashboardLayout
      role="USTADZ"
      userName={session.name}
      userId={String(session.id)}
      pageTitle="Setoran Hafalan"
    >
      <HafalanClient 
        santris={santris} 
        hafalans={hafalans} 
        ustadzId={session.id}
      />
    </DashboardLayout>
  );
}
