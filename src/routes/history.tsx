import { createFileRoute } from "@tanstack/react-router";
import { Trash2, Banknote, CreditCard, Store, ShoppingBag } from "lucide-react";
import { useHistory } from "@/lib/history";
import { yen, usd, timeAgo } from "@/lib/format";
import { TabBar } from "@/components/tab-bar";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "履歴 — Buy Helper" },
      { name: "description", content: "過去の仕入れ判定履歴。" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { items, remove, clear } = useHistory();
  const buyCount = items.filter((i) => i.verdict === "BUY").length;
  const totalProfit = items.filter((i) => i.verdict === "BUY").reduce((s, i) => s + i.profit, 0);

  return (
    <div className="min-h-screen w-full flex justify-center bg-background">
      <main className="w-full max-w-[440px] px-4 safe-top pb-32">
        <header className="pt-2 pb-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            History
          </div>
          <h1 className="text-2xl font-bold">履歴</h1>
        </header>

        <section className="grid grid-cols-3 gap-2 mb-5">
          <SummaryCard label="判定" value={String(items.length)} unit="件" />
          <SummaryCard label="BUY" value={String(buyCount)} unit="件" tone="pos" />
          <SummaryCard label="想定利益" value={`¥${yen(totalProfit)}`} />
        </section>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <div className="text-4xl mb-2">🧥</div>
            <p className="text-sm text-muted-foreground">
              まだ履歴はありません。<br />仕入れ画面で判定を保存してください。
            </p>
          </div>
        ) : (
          <>
            <ul className="space-y-2">
              {items.map((i) => (
                <li key={i.id} className="rounded-2xl bg-card border border-border p-3.5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={[
                          "num text-[10px] font-black px-2 py-0.5 rounded-md",
                          i.verdict === "BUY"
                            ? "bg-success/20 text-success"
                            : "bg-destructive/20 text-destructive"
                        ].join(" ")}>
                          {i.verdict}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {timeAgo(i.ts)}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="num text-lg font-bold">${usd(i.usd)}</span>
                        <span className="text-xs text-muted-foreground">→</span>
                        <span className="num text-lg font-bold">¥{yen(i.jpyCost)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-0.5">
                          {i.payment === "cash" ? <Banknote className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                          {i.payment === "cash" ? "現金" : "カード"}
                        </span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-0.5">
                          {i.place === "flea" ? <ShoppingBag className="w-3 h-3" /> : <Store className="w-3 h-3" />}
                          {i.place === "flea" ? "フリマ" : "ストア"}
                        </span>
                        <span>·</span>
                        <span className="num">売¥{yen(i.sellJpy)}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">利益率</div>
                      <div className={[
                        "num text-lg font-bold",
                        i.marginPct >= 40 ? "text-success" : "text-destructive"
                      ].join(" ")}>
                        {i.marginPct.toFixed(0)}%
                      </div>
                      <button
                        onClick={() => remove(i.id)}
                        aria-label="削除"
                        className="mt-1 w-8 h-8 rounded-lg grid place-items-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:scale-90 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <button
              onClick={() => { if (confirm("履歴をすべて削除しますか?")) clear(); }}
              className="mt-6 w-full h-12 rounded-2xl border border-border text-sm text-muted-foreground hover:text-destructive hover:border-destructive/40 transition"
            >
              すべて削除
            </button>
          </>
        )}
      </main>
      <TabBar />
    </div>
  );
}

function SummaryCard({ label, value, unit, tone }: { label: string; value: string; unit?: string; tone?: "pos" }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-3">
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={[
        "num font-bold mt-1 flex items-baseline gap-0.5",
        tone === "pos" ? "text-success" : ""
      ].join(" ")}>
        <span className="text-lg leading-none">{value}</span>
        {unit && <span className="text-[10px] text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}
