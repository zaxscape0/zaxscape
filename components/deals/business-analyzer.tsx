"use client";

import { useState, useMemo } from "react";
import { BusinessInputs, calcBusiness } from "@/lib/deal-calculations";
import { NumberInput } from "@/components/deals/number-input";
import { formatCurrency, formatNumber } from "@/lib/format";

const defaultInputs: BusinessInputs = {
  purchasePrice: 250000,
  sdeCashFlow: 85000,
  downPaymentPct: 20,
  interestRate: 7.5,
  loanTerm: 10,
  sbaGuaranteePct: 3,
  sellerFinancingAmount: 75000,
  sellerFinancingRate: 6,
  sellerFinancingTerm: 5,
  ownerReplacementSalary: 50000,
  workingCapital: 15000,
  cleanupCosts: 5000,
};

export function BusinessAnalyzer() {
  const [inputs, setInputs] = useState<BusinessInputs>(defaultInputs);

  const update = (field: keyof BusinessInputs) => (value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const results = useMemo(() => calcBusiness(inputs), [inputs]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Inputs */}
      <div className="space-y-4">
        <div className="rounded-md border bg-card p-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Deal Terms
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <NumberInput label="Purchase Price" value={inputs.purchasePrice} onChange={update("purchasePrice")} prefix="$" step={5000} />
            <NumberInput label="SDE / Cash Flow" value={inputs.sdeCashFlow} onChange={update("sdeCashFlow")} prefix="$" step={1000} />
            <NumberInput label="Down Payment" value={inputs.downPaymentPct} onChange={update("downPaymentPct")} suffix="%" step={1} min={0} max={100} />
            <NumberInput label="Interest Rate" value={inputs.interestRate} onChange={update("interestRate")} suffix="%" step={0.25} min={0} />
            <NumberInput label="Loan Term (yrs)" value={inputs.loanTerm} onChange={update("loanTerm")} step={1} min={1} max={25} />
            <NumberInput label="SBA Guarantee Fee" value={inputs.sbaGuaranteePct} onChange={update("sbaGuaranteePct")} suffix="%" step={0.5} min={0} />
          </div>
        </div>

        <div className="rounded-md border bg-card p-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Seller Financing
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <NumberInput label="Seller Note Amount" value={inputs.sellerFinancingAmount} onChange={update("sellerFinancingAmount")} prefix="$" step={5000} />
            <NumberInput label="Seller Note Rate" value={inputs.sellerFinancingRate} onChange={update("sellerFinancingRate")} suffix="%" step={0.25} />
            <NumberInput label="Seller Note Term" value={inputs.sellerFinancingTerm} onChange={update("sellerFinancingTerm")} step={1} min={1} max={15} />
          </div>
        </div>

        <div className="rounded-md border bg-card p-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Buyer Costs
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <NumberInput label="Owner Salary" value={inputs.ownerReplacementSalary} onChange={update("ownerReplacementSalary")} prefix="$" step={5000} />
            <NumberInput label="Working Capital" value={inputs.workingCapital} onChange={update("workingCapital")} prefix="$" step={1000} />
            <NumberInput label="Cleanup Costs" value={inputs.cleanupCosts} onChange={update("cleanupCosts")} prefix="$" step={500} />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {/* Quick Stats */}
        <div className="rounded-md border bg-card p-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Deal Overview
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <MetricBox label="Asking Multiple" value={`${formatNumber(results.askingMultiple, 2)}x`} />
            <MetricBox label="Simple Payback" value={`${formatNumber(results.simplePayback, 1)} yrs`} />
          </div>
        </div>

        {/* Scenario Comparison */}
        <div className="rounded-md border bg-card overflow-hidden">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground px-4 pt-3 pb-2">
            Financing Comparison
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono tabular-nums">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="py-2 px-3 text-left text-xxs text-muted-foreground uppercase tracking-wider">Metric</th>
                  <th className="py-2 px-3 text-right text-xxs text-muted-foreground uppercase tracking-wider">SBA 7(a)</th>
                  <th className="py-2 px-3 text-right text-xxs text-muted-foreground uppercase tracking-wider">Conventional</th>
                  <th className="py-2 px-3 text-right text-xxs text-muted-foreground uppercase tracking-wider">Seller Finance</th>
                </tr>
              </thead>
              <tbody>
                <CompRow
                  label="Down Payment"
                  sba={formatCurrency(results.sbaDownPayment)}
                  conv={formatCurrency(results.convDownPayment)}
                  seller={formatCurrency(results.sellerDownPayment)}
                />
                <CompRow
                  label="Loan Amount"
                  sba={formatCurrency(results.sbaLoanAmount)}
                  conv={formatCurrency(results.convLoanAmount)}
                  seller={formatCurrency(results.sellerLoanAmount)}
                />
                <CompRow
                  label="Monthly Payment"
                  sba={formatCurrency(results.sbaMonthlyPayment)}
                  conv={formatCurrency(results.convMonthlyPayment)}
                  seller={formatCurrency(results.sellerMonthlyPayment)}
                />
                <CompRow
                  label="Annual Debt Service"
                  sba={formatCurrency(results.sbaAnnualDebtService)}
                  conv={formatCurrency(results.convAnnualDebtService)}
                  seller={formatCurrency(results.sellerAnnualDebtService)}
                />
                <CompRow
                  label="DSCR"
                  sba={formatNumber(results.sbaDscr, 2)}
                  conv={formatNumber(results.convDscr, 2)}
                  seller={formatNumber(results.sellerDscr, 2)}
                  highlight
                />
                <CompRow
                  label="Net to Buyer"
                  sba={formatCurrency(results.sbaNetToBuyer)}
                  conv={formatCurrency(results.convNetToBuyer)}
                  seller={formatCurrency(results.sellerNetToBuyer)}
                  bold
                />
                <CompRow
                  label="Total Equity"
                  sba={formatCurrency(results.sbaTotalEquity)}
                  conv={formatCurrency(results.convTotalEquity)}
                  seller={formatCurrency(results.sellerTotalEquity)}
                />
                <CompRow
                  label="ROI on Equity"
                  sba={`${formatNumber(results.sbaRoi, 1)}%`}
                  conv={`${formatNumber(results.convRoi, 1)}%`}
                  seller={`${formatNumber(results.sellerRoi, 1)}%`}
                  bold
                  highlight
                />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/30 p-3">
      <p className="text-xxs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold font-mono tabular-nums mt-1">{value}</p>
    </div>
  );
}

function CompRow({
  label,
  sba,
  conv,
  seller,
  bold,
  highlight,
}: {
  label: string;
  sba: string;
  conv: string;
  seller: string;
  bold?: boolean;
  highlight?: boolean;
}) {
  const cellClass = `py-2 px-3 text-right ${bold ? "font-bold" : ""} ${
    highlight ? "text-primary" : ""
  }`;
  return (
    <tr className="border-b border-border/50">
      <td className={`py-2 px-3 ${bold ? "font-bold" : "text-muted-foreground"}`}>{label}</td>
      <td className={cellClass}>{sba}</td>
      <td className={cellClass}>{conv}</td>
      <td className={cellClass}>{seller}</td>
    </tr>
  );
}
