import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "./components/ui/card";
import { IBalance } from "./lib/types/user.types";
import { formatNaira } from "./lib/utils";
import { DepositModal } from "./components/deposit-modal";
import { useState } from "react";

export function BalanceCard({
  balance,
//   onDepositClick,
}: {
  balance: IBalance;
//   onDepositClick: () => void;
}) {
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  // const ava
  return (
    <>
      <Card
        variant="tinted"
        className="relative overflow-hidden col-span-2"
        style={{
          background:
            "linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)",
        }}
      >
        {/* Decorative blobs */}
        <div
          className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #6ee7b7 0%, transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/3 w-32 h-32 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #a7f3d0 0%, transparent 70%)",
          }}
        />

        <CardHeader className="pb-2 relative z-10">
          <p className="text-emerald-300/70 text-xs font-semibold uppercase tracking-widest">
            Total Balance
          </p>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex items-end gap-3 mb-4">
            <span
              className="text-4xl font-bold text-white"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {formatNaira(Number(balance?.available_wallet) ?? 0)}
            </span>
            <span className="mb-1 text-sm text-emerald-300/60">NGN</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-emerald-300/60 text-xs mb-1">Available</p>
              <p className="text-white font-semibold">
                {formatNaira(Number(balance?.available_wallet) ?? 0)}
              </p>
            </div>
            <div>
              <p className="text-emerald-300/60 text-xs mb-1">Pending</p>
              <p className="text-white font-semibold">
                {formatNaira(Number(balance?.pending_wallet) ?? 0)}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="relative z-10 border-t border-white/10 gap-3">
          <Button
            size="sm"
            onClick={() => setIsDepositModalOpen(true)}
            className="rounded-lg bg-white/15 text-white hover:bg-white/25 border-0"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 mr-1.5" />
            Fund Wallet
          </Button>
          <Button
            size="sm"
            className="rounded-lg bg-white/10 text-white hover:bg-white/20 border-0"
          >
            <ArrowUpRight className="w-3.5 h-3.5 mr-1.5" />
            Withdraw
          </Button>
        </CardFooter>
      </Card>
      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />
    </>
  );
}
