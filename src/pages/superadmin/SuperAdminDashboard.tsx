import { useQuery } from "@tanstack/react-query";
import { Building2, ToggleLeft, ToggleRight } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import KPICard from "@/components/KPICard";
import EmptyState from "@/components/EmptyState";
import TableSkeleton from "@/components/TableSkeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { tenantsApi, nv } from "@/lib/api";
import { superAdminNavItems } from "./navItems";

const SuperAdminDashboard = () => {
  const { data, isLoading } = useQuery({ queryKey: ["tenants", 1], queryFn: () => tenantsApi.list(1, 100) });
  const tenants = data?.data?.data ?? data?.data ?? [];
  const totalTenants = Array.isArray(tenants) ? tenants.length : 0;
  const activeTenants = Array.isArray(tenants) ? tenants.filter((t: any) => t.is_active).length : 0;

  return (
    <DashboardLayout navItems={superAdminNavItems} title="Super Admin Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KPICard title="Total Tenants" value={isLoading ? "..." : totalTenants} icon={Building2} description="All registered schools" />
        <KPICard title="Active Tenants" value={isLoading ? "..." : activeTenants} icon={ToggleRight} description="Currently active" />
        <KPICard title="Inactive" value={isLoading ? "..." : totalTenants - activeTenants} icon={ToggleLeft} description="Deactivated schools" />
      </div>
      <div className="bg-card rounded-xl border border-border/50 p-6">
        <h3 className="font-display text-lg font-semibold mb-4">Recent Tenants</h3>
        {isLoading ? <TableSkeleton /> : !Array.isArray(tenants) || tenants.length === 0 ? <EmptyState title="No tenants yet" description="Create your first tenant to get started." /> : (
          <Table>
            <TableHeader><TableRow>
              <TableHead>Name</TableHead><TableHead>Address</TableHead><TableHead>Phone</TableHead><TableHead>Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {tenants.slice(0, 5).map((t: any) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{nv(t.name)}</TableCell>
                  <TableCell>{nv(t.address)}</TableCell>
                  <TableCell>{nv(t.phone)}</TableCell>
                  <TableCell><Badge variant={t.is_active ? "default" : "secondary"}>{t.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
