import { createFileRoute } from "@tanstack/react-router";
import { Moon, Sun, RefreshCw } from "lucide-react";
import { useSettings } from "@/lib/settings";
import { TabBar } from "@/components/tab-bar";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "設定 — Buy Helper" },
      { name: "description", content: "為替レート、税率、利益率、テーマの設定。" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, update, hydrated } = useSettings();
  if (!hydrated) return <div className="min-h-screen bg-background" />;

  const refreshTime = () => update({ lastRateUpdated: new Date().toISOString() });

  return (
    <div className="min-h-screen w-full flex justify-center bg-background">
      <main className="w-full max-w-[440px] px-4 safe-top pb-32">
        <header className="pt-2 pb-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Settings
          </div>
          <h1 className="text-2xl font-bold">設定</h1>
        </header>

        <Group title="為替レート">
          <NumRow
            label="現金レート"
            hint="JPY / USD"
            value={settings.cashRate}
            step={0.1}
            onChange={(v) => update({ cashRate: v, lastRateUpdated: new Date().toISOString() })}
          />
          <NumRow
            label="カード手数料"
            hint="海外決済手数料 (現金レートに上乗せ)"
            value={settings.cardFeePct}
            step={0.1}
            onChange={(v) => update({ cardFeePct: v })}
            suffix="%"
          />

          <ToggleRow
            label="API自動取得"
            hint="毎朝レートを自動更新"
            checked={settings.apiFetchOn}
            onChange={(v) => update({ apiFetchOn: v })}
          />
          <button
            onClick={refreshTime}
            className="w-full min-h-[52px] px-4 flex items-center justify-between text-left"
          >
            <span className="text-sm">更新</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <RefreshCw className="w-3.5 h-3.5" /> {new Date(settings.lastRateUpdated).toLocaleString("ja-JP")}
            </span>
          </button>
        </Group>

        <Group title="計算">
          <NumRow
            label="ストア税率"
            hint="%"
            value={settings.storeTaxPct}
            step={0.25}
            onChange={(v) => update({ storeTaxPct: v })}
            suffix="%"
          />
          <NumRow
            label="利益率 初期値"
            hint="仕入れ画面のデフォルト"
            value={settings.defaultMarginPct}
            step={5}
            onChange={(v) => update({ defaultMarginPct: v })}
            suffix="%"
          />
        </Group>

        <Group title="外観">
          <div className="p-4">
            <div className="text-sm mb-3">テーマ</div>
            <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-secondary border border-border">
              <ThemeBtn active={settings.theme === "light"} onClick={() => update({ theme: "light" })}>
                <Sun className="w-4 h-4" /> ライト
              </ThemeBtn>
              <ThemeBtn active={settings.theme === "dark"} onClick={() => update({ theme: "dark" })}>
                <Moon className="w-4 h-4" /> ダーク
              </ThemeBtn>
            </div>
          </div>
        </Group>

        <div className="mt-8 rounded-2xl border border-dashed border-border p-4">
          <div className="text-xs font-semibold mb-1">📱 iPhoneにインストール</div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Safariで開く → 共有ボタン → 「ホーム画面に追加」で、アプリのように使えます。
          </p>
        </div>

        <p className="text-center text-[10px] text-muted-foreground mt-6 tracking-widest uppercase">
          Buy Helper · v1.0
        </p>
      </main>
      <TabBar />
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground mb-2 px-1">
        {title}
      </div>
      <div className="rounded-2xl bg-card border border-border divide-y divide-border overflow-hidden">
        {children}
      </div>
    </section>
  );
}

function NumRow({
  label, hint, value, step, onChange, suffix,
}: {
  label: string; hint?: string; value: number; step: number;
  onChange: (v: number) => void; suffix?: string;
}) {
  return (
    <div className="p-4 grid grid-cols-[minmax(0,1fr)_auto] gap-3 items-center min-h-[52px]">
      <div className="min-w-0">
        <div className="text-sm truncate">{label}</div>
        {hint && <div className="text-[10px] text-muted-foreground mt-0.5">{hint}</div>}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onChange(Number((value - step).toFixed(2)))}
          className="w-11 h-11 rounded-xl bg-secondary grid place-items-center active:scale-90 transition"
          aria-label="下げる"
        >−</button>
        <div className="relative">
          <input
            type="number"
            inputMode="decimal"
            value={value}
            step={step}
            onChange={(e) => onChange(Number(e.target.value) || 0)}
            className="w-24 h-11 rounded-xl bg-input border-none num text-right font-bold px-2 focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          {suffix && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">{suffix}</span>}
        </div>
        <button
          onClick={() => onChange(Number((value + step).toFixed(2)))}
          className="w-11 h-11 rounded-xl bg-secondary grid place-items-center active:scale-90 transition"
          aria-label="上げる"
        >+</button>
      </div>
    </div>
  );
}

function ToggleRow({
  label, hint, checked, onChange,
}: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full p-4 grid grid-cols-[minmax(0,1fr)_auto] gap-3 items-center text-left min-h-[52px]"
    >
      <div className="min-w-0">
        <div className="text-sm truncate">{label}</div>
        {hint && <div className="text-[10px] text-muted-foreground mt-0.5">{hint}</div>}
      </div>
      <span className={[
        "shrink-0 w-11 h-7 rounded-full relative transition-colors",
        checked ? "bg-accent" : "bg-secondary border border-border"
      ].join(" ")}>
        <span className={[
          "absolute top-0.5 w-6 h-6 rounded-full bg-background shadow transition-all",
          checked ? "left-[18px]" : "left-0.5"
        ].join(" ")} />
      </span>
    </button>
  );
}

function ThemeBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={[
        "min-h-[44px] rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all",
        active ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground"
      ].join(" ")}
    >
      {children}
    </button>
  );
}
