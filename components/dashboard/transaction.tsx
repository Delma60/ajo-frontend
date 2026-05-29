import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBadge,
  CardStat,
  CardProgress,
  CardFooter,
  CardDivider,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ITransaction } from "@/lib/types/transaction.types";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function TransactionsSection({
  transactions = [],
  loading = false,
}: {
  transactions: ITransaction[];
  loading?: boolean;
}) {
  if (loading) return <TransactionsSectionSkeleton />;

  return (
    <Card variant="default">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription className="mt-0.5">
              Deposits, withdrawals &amp; contributions
            </CardDescription>
          </div>
          <Link href="/transactions/history" className="ml-auto">
            <Button
              size="sm"
              variant="ghost"
              className="rounded-lg text-emerald-700 hover:text-emerald-800"
            >
              View all <ChevronRight size={14} className="ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead align="right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableEmpty
                colSpan={4}
                message="No transactions yet. Make your first deposit to get started."
              />
            ) : (
              transactions.map((tx, i) => (
                <TableRow key={i} hoverable>
                  {/* <TableCell>{tx.description}</TableCell> */}
                  <TableCell mono>{tx.amount}</TableCell>
                  <TableCell muted>{tx.created_at}</TableCell>
                  <TableCell align="right">
                    <CardBadge
                      color={
                        tx.status === "success"
                          ? "green"
                          : tx.status === "pending"
                            ? "amber"
                            : "red"
                      }
                      dot
                    >
                      {tx.status}
                    </CardBadge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function TransactionsSectionSkeleton() {
  return (
    <Card variant="default" className="animate-pulse">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-36 bg-zinc-200 rounded-md" />
            <div className="h-3 w-56 bg-zinc-100 rounded-md" />
          </div>
          <div className="h-8 w-20 bg-zinc-100 rounded-lg" />
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="rounded-2xl border border-zinc-100 overflow-hidden">
          {/* Table Header Placeholder */}
          <div className="bg-zinc-50/50 px-5 py-3 flex items-center justify-between border-b border-zinc-100">
            <div className="h-2.5 w-16 bg-zinc-200/60 rounded" />
            <div className="h-2.5 w-12 bg-zinc-200/60 rounded" />
            <div className="h-2.5 w-12 bg-zinc-200/60 rounded" />
            <div className="h-2.5 w-12 bg-zinc-200/60 rounded" />
          </div>
          {/* Row Placeholders */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="px-5 py-4 flex items-center justify-between border-b border-zinc-50 last:border-0"
            >
              <div className="h-3.5 w-24 bg-zinc-100 rounded" />
              <div className="h-3.5 w-16 bg-zinc-100 rounded" />
              <div className="h-3.5 w-20 bg-zinc-100/50 rounded" />
              <div className="h-6 w-14 bg-zinc-100/80 rounded-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}