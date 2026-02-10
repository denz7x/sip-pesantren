import { requireAuth } from "@/lib/auth";
import { db } from "@/db";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import KasirClient from "./KasirClient";

export default async function UstadzKasirPage() {
  const session = await requireAuth(["USTADZ"]);

  // Fetch data from Google Sheets
  const santris = await db.select('santris');
  const transaksis = await db.select('transaksis');

  return (
    <DashboardLayout
      role="USTADZ"
      userName={session.name}
      userId={String(session.id)}
      pageTitle="POS / Kasir"
    >
      <KasirClient 
        santris={santris} 
        transaksis={transaksis} 
        ustadzId={session.id}
      />
    </DashboardLayout>
  );
}
