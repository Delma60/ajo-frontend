import { Card, CardBadge, CardContent, CardHeader } from "./ui/card";

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "emerald",
  badge,
  loading = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color?: "emerald" | "amber" | "blue" | "rose";
  badge?: string;
  loading?: boolean;
}) {
  if (loading) return <StatCardSkeleton />;

  const colorMap = {
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    rose: "bg-rose-50 text-rose-700",
  };
  return (
    <Card variant="default" className="hover:shadow-sm transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${colorMap[color]}`}
          >
            <Icon className="w-4.5 h-4.5" size={18} />
          </span>
          {badge && (
            <CardBadge color="gray" dot>
              {badge}
            </CardBadge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p
          className="text-2xl font-bold text-zinc-900 tracking-tight"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {value}
        </p>
        <p className="text-xs text-zinc-400 mt-0.5 font-medium uppercase tracking-wide">
          {label}
        </p>
        {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card variant="default" className="animate-pulse">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          {/* Icon placeholder */}
          <div className="w-9 h-9 rounded-xl bg-zinc-100" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Value placeholder */}
        <div className="h-7 w-20 bg-zinc-200 rounded-md mb-2" />
        {/* Label placeholder */}
        <div className="h-3 w-24 bg-zinc-100 rounded-md" />
        {/* Sub placeholder */}
        <div className="h-3 w-32 bg-zinc-50 rounded-md mt-2" />
      </CardContent>
    </Card>
  );
}