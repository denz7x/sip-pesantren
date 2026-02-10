import { requireAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { db } from "@/db";
import UstadzClient from "./UstadzClient";

export default async function AdminUstadzPage() {
  const session = await requireAuth(["ADMIN"]);

  // Fetch data from Google Sheets
  const ustadzs = await db.select('ustadzs');
  const users = await db.select('users');

  // Merge ustadz data with user email
  const ustadzsWithEmail = ustadzs.map((ustadz: any) => {
    const user = users.find((u: any) => u.id === ustadz.userId);
    return {
      ...ustadz,
      email: user?.email || '-',
    };
  });

  return (
    <DashboardLayout
      role="ADMIN"
      userName={session.name}
      userId={String(session.id)}
      pageTitle="Kelola Ustadz"
    >

      <UstadzClient ustadzs={ustadzsWithEmail} />
    </DashboardLayout>
  );
}
