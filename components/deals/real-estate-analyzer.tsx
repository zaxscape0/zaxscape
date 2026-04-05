"use client";

import { useState, useMemo } from "react";
import { RealEstateInputs, calcRealEstate, calcSensitivityTable } from "@/lib/deal-calculations";
import { NumberInput } from "@/components/deals/number-input";
import { formatCurrency, formatNumber } from "@/lib/format";

const defaultInputs: RealEstateInputs = {
  purchasePrice: 350000,
  downPaymentPct: 25,
  interestRate: 6.5,
  amortYears: 30,
  closingCosts: 8000,
  renoBudget: 15000,
  vacancyPct: 8,
  repairsPct: 5,
  managementPct: 10,
  annualTaxes: 4200,
  annualInsurance: 1800,
  hoa: 0,
  monthlyGrossRent: 3500,
  otherIncome: 0,
};

export function RealEstateAnalyzer() {
  const [inputs, setInputs] = useState<RealEstateInputs>(defaultInputs);

  const update = (field: keyof RealEstateInputs) => (value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const results = useMemo(() => calcRealEstate(inputs), [inputs]);
  const sensitivity = useMemo(() => calcSensitivityTable(inputs), [inputs]);

  // Group sensitivity by rate
  const rateSteps = [-1, -0.5, 0, 0.5, 1];
  const vacancySteps = [-5, 0, 5];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Inputs */}
      <div className="space-y-4">
        <div className="rounded-md border bg-card p-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Acquisition
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <NumberInput label="Purchase Price" value={inputs.purchasePrice} onChange={update("purchasePrice")} prefix="$" step={5000} />
            <NumberInput label="Down Payment" value={inputs.downPaymentPct} onChange={update("downPaymentPct")} suffix="%" step={1} min={0} max={100} />
            <NumberInput label="Interest Rate" value={inputs.interestRate} onChange={update("interestRate")} suffix="%" step={0.125} min={0} />
            <NumberInput label="Amort Years" value={inputs.amortYears} onChange={update("amortYears")} step={1} min={1} max={40} />
            <NumberInput label="Closing Costs" value={inputs.closingCosts} onChange={update("closingCosts")} prefix="$" step={500} />
            <NumberInput label="Reno Budget" value={inputs.renoBudget} onChange={update("renoBudget")} prefix="$" step={1000} />
          </div>
        </div>

        <div className="rounded-md border bg-card p-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Income
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <NumberInput label="Monthly Gross Rent" value={inputs.monthlyGrossRent} onChange={update("monthlyGrossRent")} prefix="$" step={100} />
            <NumberInput label="Other Income (mo)" value={inputs.otherIncome} onChange={update("otherIncome")} prefix="$" step={50} />
          </div>
        </div>

        <div className="rounded-md border bg-card p-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Expenses
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <NumberInput label="Vacancy" value={inputs.vacancyPct} onChange={update("vacancyPct")} suffix="%" step={1} min={0} max={50} />
            <NumberInput label="Repairs" value={inputs.repairsPct} onChange={update("repairsPct")} suffix="%" step={1} min={0} />
            <NumberInput label="Management" value={inputs.managementPct} onChange={update("managementPct")} suffix="%" step={1} min={0} />
            <NumberInput label="Annual Taxes" value={inputs.annualTaxes} onChange={update("annualTaxes")} prefix="$" step={100} />
            <NumberInput label="Annual Insurance" value={inputs.annualInsurance} onChange={update("annualInsurance")} prefix="$" step={100} />
            <NumberInput label="HOA (monthly)" value={inputs.hoa} onChange={update("hoa")} prefix="$" step={25} />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {/* Key Metrics */}
        <div className="rounded-md border bg-card p-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Key Metrics
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <MetricBox
              label="Cap Rate"
              value={`${formatNumber(results.capRate, 2)}%`}
              highlight={results.capRate >= 8}
            />
            <MetricBox
              label="Cash-on-Cash"
              value={`${formatNumber(results.cashOnCashReturn, 2)}%`}
              highlight={results.cashOnCashReturn >= 10}
              warning={results.cashOnCashReturn < 0}
            />
            <MetricBox label="GRM" value={formatNumber(results.grm, 2)} />
            <MetricBox
              label="DSCR"
              value={formatNumber(results.dscr, 2)}
              highlight={results.dscr >= 1.25}
              warning={results.dscr < 1}
            />
          </div>
        </div>

        {/* Cash Flow */}
        <div className="rounded-md border bg-card p-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Cash Flow Analysis
          </h3>
          <div className="space-y-2 text-xs font-mono tabular-nums">
            <FlowRow label="Effective Gross Income" value={formatCurrency(results.effectiveGrossIncome)} />
            <FlowRow label="Operating Expenses" value={`(${formatCurrency(results.totalOperatingExpenses)})`} negative />
            <div className="border-t border-border my-1" />
            <FlowRow label="NOI" value={formatCurrency(results.noi)} bold />
            <FlowRow label="Annual Debt Service" value={`(${formatCurrency(results.annualDebtService)})`} negative />
            <div className="border-t border-border my-1" />
            <FlowRow
              label="Cash Flow After Debt"
              value={formatCurrency(results.cashFlowAfterDebt)}
              bold
              highlight={results.cashFlowAfterDebt > 0}
              warning={results.cashFlowAfterDebt < 0}
            />
            <FlowRow
              label="Monthly Cash Flow"
              value={formatCurrency(results.cashFlowAfterDebt / 12)}
              highlight={results.cashFlowAfterDebt > 0}
              warning={results.cashFlowAfterDebt < 0}
            />
          </div>
        </div>

        {/* Debt Details */}
        <div className="rounded-md border bg-card p-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Investment Summary
          </h3>
          <div className="space-y-2 text-xs font-mono tabular-nums">
            <FlowRow label="Loan Amount" value={formatCurrency(results.loanAmount)} />
            <FlowRow label="Monthly Payment" value={formatCurrency(results.monthlyPayment)} />
            <FlowRow label="Total Cash Invested" value={formatCurrency(results.totalCashInvested)} bold />
            <FlowRow
              label="Break-Even Occupancy"
              value={`${formatNumber(results.breakEvenOccupancy, 1)}%`}
              warning={results.breakEvenOccupancy > 90}
            />
          </div>
        </div>

        {/* Sensitivity Table */}
        <div className="rounded-md border bg-card p-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Sensitivity: Cash-on-Cash Return
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono tabular-nums">
              <thead>
                <tr className="border-b">
                  <th className="py-1.5 px-2 text-left text-xxs text-muted-foreground">Rate \ Vacancy</th>
                  {vacancySteps.map((v) => (
                    <th key={v} className="py-1.5 px-2 text-right text-xxs text-muted-foreground">
                      {inputs.vacancyPct + v}%
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rateSteps.map((r) => (
                  <tr key={r} className="border-b border-border/50">
                    <td className="py-1.5 px-2 text-muted-foreground">
                      {formatNumber(inputs.interestRate + r, 2)}%
                    </td>
                    {vacancySteps.map((v) => {
                      const cell = sensitivity.find(
                        (s) =>
                          Math.abs(s.rate - (inputs.interestRate + r)) < 0.01 &&
                          Math.abs(s.vacancy - (inputs.vacancyPct + v)) < 0.01
                      );
                      const coc = cell?.coc ?? 0;
                      const isBase = r === 0 && v === 0;
                      return (
                        <td
                          key={`${r}-${v}`}
                          className={`py-1.5 px-2 text-right ${
                            isBase ? "font-bold bg-accent/50" : ""
                          } ${
                            coc >= 10
                              ? "text-[hsl(var(--up))]"
                              : coc < 0
                              ? "text-[hsl(var(--down))]"
                              : ""
                          }`}
                        >
                          {formatNumber(coc, 1)}%
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricBox({
  label,
  value,
  highlight,
  warning,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  warning?: boolean;
}) {
  return (
    <div
      className={`rounded-md p-3 ${
        warning
          ? "bg-[hsl(var(--down))]/10 border border-[hsl(var(--down))]/20"
          : highlight
          ? "bg-[hsl(var(--up))]/10 border border-[hsl(var(--up))]/20"
          : "bg-muted/30"
      }`}
    >
      <p className="text-xxs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p
        className={`text-xl font-bold font-mono tabular-nums mt-1 ${
          warning ? "text-[hsl(var(--down))]" : highlight ? "text-[hsl(var(--up))]" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function FlowRow({
  label,
  value,
  bold,
  negative,
  highlight,
  warning,
}: {
  label: string;
  value: string;
  bold?: boolean;
  negative?: boolean;
  highlight?: boolean;
  warning?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`${bold ? "font-bold" : "text-muted-foreground"}`}>{label}</span>
      <span
        className={`${bold ? "font-bold" : ""} ${
          warning
            ? "text-[hsl(var(--down))]"
            : highlight
            ? "text-[hsl(var(--up))]"
            : negative
            ? "text-muted-foreground"
            : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
