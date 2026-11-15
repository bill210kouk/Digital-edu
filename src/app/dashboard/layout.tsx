import { getSession } from "@/lib/auth";
import Header from "@/components/Header";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="flex-1 flex flex-col bg-sky-50 min-h-screen">
      <Header teacherName={session?.name ?? ""} />
      <div className="flex-1 px-4 sm:px-8 py-8 max-w-5xl w-full mx-auto">{children}</div>
    </div>
  );
}
