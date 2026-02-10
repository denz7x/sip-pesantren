import { requireAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { db } from "@/db";
import SantriClient from "./SantriClient";

export default async function AdminSantriPage() {
  const session = await requireAuth(["ADMIN"]);

  // Fetch data from Google Sheets
  const santris = await db.select('santris');
  const orangTuas = await db.select('orangTua');

  return (
    <DashboardLayout
      role="ADMIN"
      userName={session.name}
      userId={String(session.id)}
      pageTitle="Kelola Santri"
    >

      <SantriClient 
        santris={santris} 
        orangTuas={orangTuas.map(ot => ({ id: ot.id, nama: ot.nama }))} 
      />
    </DashboardLayout>
  );
}
