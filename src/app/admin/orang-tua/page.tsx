import { requireAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { db } from "@/db";
import OrangTuaClient from "./OrangTuaClient";

export default async function AdminOrangTuaPage() {
  const session = await requireAuth(["ADMIN"]);

  // Fetch data from Google Sheets
  const orangTuas = await db.select('orangTua') || [];

  return (
    <DashboardLayout
      role="ADMIN"
      userName={session.name}
      userId={String(session.id)}
      pageTitle="Kelola Orang Tua"
    >

      <OrangTuaClient orangTuas={orangTuas} />
    </DashboardLayout>
  );
}
