import { requireAuth } from "@/lib/auth";
import { db } from "@/db";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import PelanggaranClient from "./PelanggaranClient";

export default async function UstadzPelanggaranPage() {
  const session = await requireAuth(["USTADZ"]);

  // Fetch data from Google Sheets
  const santris = await db.select('santris');
  const pelanggarans = await db.select('pelanggarans');

  return (
    <DashboardLayout
      role="USTADZ"
      userName={session.name}
      userId={String(session.id)}
      pageTitle="Jurnal Pelanggaran"
    >
      <PelanggaranClient 
        santris={santris} 
        pelanggarans={pelanggarans} 
        ustadzId={session.id}
      />
    </DashboardLayout>
  );
}
