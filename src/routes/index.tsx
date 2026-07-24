import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Banknote, CreditCard, Store, ShoppingBag, Minus, Plus,
  RefreshCw, Delete, Save, Check,
} from "lucide-react";
import { useSettings, type Payment, type Place } from "@/lib/settings";
import { useHistory } from "@/lib/history";
import { yen, usd, timeAgo } from "@/lib/format";
import { TabBar } from "@/components/tab-bar";

export const Route = createFileRoute("/")({
  component: BuyHelper,
});

function BuyHelper() {
  const { settings, hydrated } = useSettings();
  const { add } = useHistory();

  const [usdInput, setUsdInput] = useState("");
  const [payment, setPayment] = useState<Payment>("cash");
  const [place, setPlace] = useState<Place>("store");
  const [marginPct, setMarginPct] = useState(settings.defaultMarginPct);
  const [saved, setSaved] = useState(false);

  const usdNum = parseFloat(usdInput) || 0;
  const taxRate = place === "store" ? settings.storeTaxPct / 100 : 0;
  const fxRate = payment === "cash" ? settings.cashRate : settings.cashRate * (1 + settings.cardFeePct / 100);

  const c = useMemo(() => {
    const taxedUsd = usdNum * (1 + taxRate);
    const jpyCost = taxedUsd * fxRate;
    const requiredSellJpy = marginPct < 100 ? jpyCost / (1 - marginPct / 100) : 0;
    return { taxedUsd, jpyCost, requiredSellJpy };
  }, [usdNum, taxRate, fxRate, marginPct]);

  const canSave = usdNum > 0;

  const handleSave = () => {
    if (!canSave) return;
    add({
      usd: usdNum, payment, place,
      jpyCost: c.jpyCost, sellJpy: c.requiredSellJpy, marginPct,
      verdict: "BUY", profit: c.requiredSellJpy - c.jpyCost,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
  };

  if (!hydrated) return <div className="min-h-screen bg-background" />;

  return (
    <div className="min-h-screen w-full flex justify-center bg-background">
      <main className="w-full max-w-[440px] px-4 safe-top pb-32">
        {/* Header */}
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 pt-2 pb-4">
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Buy Helper
            </div>
            <h1 className="truncate text-2xl font-bold mt-0.5">仕入判定</h1>
          </div>
          <div className="shrink-0 flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2">
            <span className="text-base leading-none">🇺🇸</span>
            <span className="text-[11px] font-semibold text-muted-foreground">USD</span>
          </div>
        </header>

        {/* Today's FX */}
        <section className="rounded-3xl bg-card border border-border p-3.5 mb-5">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs text-muted-foreground">今日の為替</span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <RefreshCw className="w-3 h-3" />
              {timeAgo(new Date(settings.lastRateUpdated).getTime())}更新
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <RateChip
              icon={<Banknote className="w-4 h-4" />}
              label="現金"
              rate={settings.cashRate}
              active={payment === "cash"}
              onClick={() => setPayment("cash")}
            />
            <RateChip
              icon={<CreditCard className="w-4 h-4" />}
              label="カード"
              rate={settings.cashRate * (1 + settings.cardFeePct / 100)}
              active={payment === "card"}
              onClick={() => setPayment("card")}
            />
          </div>
        </section>

        {/* USD input */}
        <section className="mb-5">
          <Label>USD価格</Label>
          <div className="relative">
            <form onSubmit={(e) => { e.preventDefault(); (e.currentTarget.querySelector("input") as HTMLInputElement | null)?.blur(); }}>
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground num">$</span>
              <input
                inputMode="decimal"
                type="number"
                step="0.01"
                enterKeyHint="done"
                value={usdInput}
                onChange={(e) => setUsdInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); (e.target as HTMLInputElement).blur(); } }}
                placeholder="0.00"
                className="w-full h-20 rounded-3xl bg-card border border-border pl-12 pr-16 text-right num text-4xl font-extrabold focus:outline-none focus:border-accent/60"
              />
              <button
                type="button"
                onClick={() => setUsdInput("")}
                aria-label="消去"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full grid place-items-center text-muted-foreground hover:bg-secondary active:scale-95 transition"
              >
                <Delete className="w-5 h-5" />
              </button>
            </form>
          </div>
        </section>

        {/* Payment & Place */}
        <section className="mb-5 grid grid-cols-2 gap-3">
          <SegmentGroup label="支払い">
            <Segment active={payment === "cash"} onClick={() => setPayment("cash")}>
              <Banknote className="w-4 h-4" /> 現金
            </Segment>
            <Segment active={payment === "card"} onClick={() => setPayment("card")}>
              <CreditCard className="w-4 h-4" /> カード
            </Segment>
          </SegmentGroup>
          <SegmentGroup label="購入場所">
            <Segment active={place === "flea"} onClick={() => setPlace("flea")}>
              <ShoppingBag className="w-4 h-4" /> フリマ
            </Segment>
            <Segment active={place === "store"} onClick={() => setPlace("store")}>
              <Store className="w-4 h-4" /> ストア
            </Segment>
          </SegmentGroup>
        </section>

        {/* Big minimum sell price */}
        <section className={[
          "rounded-3xl overflow-hidden border-2 mb-5 transition-colors",
          canSave
            ? "border-accent/60 bg-gradient-to-br from-accent/12 via-card to-card"
            : "border-border bg-card"
        ].join(" ")}>
          <div className="p-5">
            <div className="flex items-start justify-between mb-2 gap-3">
              <span className="text-xs text-muted-foreground">最低販売価格</span>
              <span className="text-[11px] num text-muted-foreground text-right shrink-0">
                ${usd(c.taxedUsd)} · @{fxRate.toFixed(2)}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-muted-foreground">¥</span>
              <span className="num text-[64px] leading-none font-extrabold tracking-tighter">
                {yen(c.requiredSellJpy)}
              </span>
            </div>
            <div className="mt-3 text-[11px] text-muted-foreground">
              下代 ¥{yen(c.jpyCost)} ・ {place === "store" ? `ストア (+${settings.storeTaxPct}%)` : "フリマ"} ・ {payment === "cash" ? "現金" : "カード"}
            </div>
          </div>
        </section>

        {/* Margin stepper */}
        <section className="mb-5 rounded-3xl bg-card border border-border p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">利益率</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Target margin</span>
          </div>
          <div className="grid grid-cols-[56px_minmax(0,1fr)_56px] items-center gap-2">
            <StepBtn onClick={() => setMarginPct((m) => Math.max(0, m - 5))} aria-label="下げる">
              <Minus className="w-6 h-6" />
            </StepBtn>
            <div className="text-center">
              <input
                inputMode="numeric"
                type="number"
                value={marginPct}
                onChange={(e) => setMarginPct(Math.min(99, Math.max(0, Number(e.target.value) || 0)))}
                className="w-full bg-transparent border-none num text-6xl font-extrabold text-center focus:outline-none"
              />
              <div className="text-xs text-muted-foreground -mt-1">%</div>
            </div>
            <StepBtn onClick={() => setMarginPct((m) => Math.min(99, m + 5))} aria-label="上げる">
              <Plus className="w-6 h-6" />
            </StepBtn>
          </div>
        </section>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="w-full h-16 rounded-full bg-accent text-accent-foreground font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition disabled:opacity-40 disabled:pointer-events-none"
        >
          {saved ? <><Check className="w-5 h-5" /> 保存しました</> : <><Save className="w-5 h-5" /> 履歴に保存</>}
        </button>
      </main>
      <TabBar />
    </div>
  );
}

/* ------------------------------- primitives ------------------------------- */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs text-muted-foreground mb-2 px-1">
      {children}
    </div>
  );
}

function RateChip({ icon, label, rate, active, onClick }: { icon: React.ReactNode; label: string; rate: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-full px-4 h-12 border flex items-center justify-between transition-all active:scale-[0.98]",
        active ? "border-accent bg-accent/8" : "border-border bg-secondary/40"
      ].join(" ")}
    >
      <span className="flex items-center gap-2 text-sm text-muted-foreground">{icon}{label}</span>
      <span className="num text-base font-bold text-foreground">¥{rate.toFixed(2)}</span>
    </button>
  );
}

function SegmentGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="grid grid-cols-2 gap-1 p-1 rounded-full bg-secondary/60 border border-border">
        {children}
      </div>
    </div>
  );
}

function Segment({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={[
        "min-h-[44px] rounded-full flex items-center justify-center gap-1.5 text-sm font-semibold transition-all",
        active ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground active:scale-95"
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function StepBtn({ children, onClick, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      onClick={onClick}
      {...rest}
      className="h-14 w-14 rounded-full bg-secondary border border-border grid place-items-center active:scale-90 transition hover:bg-accent/15"
    >
      {children}
    </button>
  );
}
