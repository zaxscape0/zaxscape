// ═══════════════════════════════════════════
// Real Estate Deal Calculations
// ═══════════════════════════════════════════

export interface RealEstateInputs {
  purchasePrice: number;
  downPaymentPct: number;
  interestRate: number;
  amortYears: number;
  closingCosts: number;
  renoBudget: number;
  vacancyPct: number;
  repairsPct: number;
  managementPct: number;
  annualTaxes: number;
  annualInsurance: number;
  hoa: number;
  monthlyGrossRent: number;
  otherIncome: number;
}

export interface RealEstateResults {
  loanAmount: number;
  monthlyPayment: number;
  annualDebtService: number;
  effectiveGrossIncome: number;
  totalOperatingExpenses: number;
  noi: number;
  capRate: number;
  grm: number;
  dscr: number;
  cashFlowAfterDebt: number;
  totalCashInvested: number;
  cashOnCashReturn: number;
  breakEvenOccupancy: number;
}

export function calcMortgagePayment(principal: number, annualRate: number, years: number): number {
  if (principal <= 0 || years <= 0) return 0;
  if (annualRate <= 0) return principal / (years * 12);
  const monthlyRate = annualRate / 100 / 12;
  const n = years * 12;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
}

export function calcRealEstate(inputs: RealEstateInputs): RealEstateResults {
  const downPayment = inputs.purchasePrice * (inputs.downPaymentPct / 100);
  const loanAmount = inputs.purchasePrice - downPayment;
  const monthlyPayment = calcMortgagePayment(loanAmount, inputs.interestRate, inputs.amortYears);
  const annualDebtService = monthlyPayment * 12;

  const annualGrossRent = inputs.monthlyGrossRent * 12;
  const annualOtherIncome = inputs.otherIncome * 12;
  const grossScheduledIncome = annualGrossRent + annualOtherIncome;
  const vacancyLoss = grossScheduledIncome * (inputs.vacancyPct / 100);
  const effectiveGrossIncome = grossScheduledIncome - vacancyLoss;

  const repairs = effectiveGrossIncome * (inputs.repairsPct / 100);
  const management = effectiveGrossIncome * (inputs.managementPct / 100);
  const totalOperatingExpenses =
    inputs.annualTaxes + inputs.annualInsurance + inputs.hoa * 12 + repairs + management;

  const noi = effectiveGrossIncome - totalOperatingExpenses;
  const capRate = inputs.purchasePrice > 0 ? (noi / inputs.purchasePrice) * 100 : 0;
  const grm = annualGrossRent > 0 ? inputs.purchasePrice / annualGrossRent : 0;
  const dscr = annualDebtService > 0 ? noi / annualDebtService : 0;

  const cashFlowAfterDebt = noi - annualDebtService;
  const totalCashInvested = downPayment + inputs.closingCosts + inputs.renoBudget;
  const cashOnCashReturn = totalCashInvested > 0 ? (cashFlowAfterDebt / totalCashInvested) * 100 : 0;

  const breakEvenOccupancy =
    grossScheduledIncome > 0
      ? ((totalOperatingExpenses + annualDebtService) / grossScheduledIncome) * 100
      : 0;

  return {
    loanAmount,
    monthlyPayment,
    annualDebtService,
    effectiveGrossIncome,
    totalOperatingExpenses,
    noi,
    capRate,
    grm,
    dscr,
    cashFlowAfterDebt,
    totalCashInvested,
    cashOnCashReturn,
    breakEvenOccupancy,
  };
}

// Sensitivity analysis
export function calcSensitivityTable(
  inputs: RealEstateInputs,
  rateSteps: number[] = [-1, -0.5, 0, 0.5, 1],
  vacancySteps: number[] = [-5, 0, 5]
): { rate: number; vacancy: number; coc: number }[] {
  const results: { rate: number; vacancy: number; coc: number }[] = [];
  for (const rDelta of rateSteps) {
    for (const vDelta of vacancySteps) {
      const modified = {
        ...inputs,
        interestRate: Math.max(0, inputs.interestRate + rDelta),
        vacancyPct: Math.max(0, Math.min(100, inputs.vacancyPct + vDelta)),
      };
      const res = calcRealEstate(modified);
      results.push({
        rate: modified.interestRate,
        vacancy: modified.vacancyPct,
        coc: res.cashOnCashReturn,
      });
    }
  }
  return results;
}

// ═══════════════════════════════════════════
// Business Deal Calculations
// ═══════════════════════════════════════════

export interface BusinessInputs {
  purchasePrice: number;
  sdeCashFlow: number;
  downPaymentPct: number;
  interestRate: number;
  loanTerm: number;
  sbaGuaranteePct: number;
  sellerFinancingAmount: number;
  sellerFinancingRate: number;
  sellerFinancingTerm: number;
  ownerReplacementSalary: number;
  workingCapital: number;
  cleanupCosts: number;
}

export interface BusinessResults {
  askingMultiple: number;
  simplePayback: number;
  // SBA scenario
  sbaDownPayment: number;
  sbaLoanAmount: number;
  sbaGuaranteeFee: number;
  sbaMonthlyPayment: number;
  sbaAnnualDebtService: number;
  sbaDscr: number;
  sbaNetToBuyer: number;
  sbaRoi: number;
  sbaTotalEquity: number;
  // Conventional scenario
  convDownPayment: number;
  convLoanAmount: number;
  convMonthlyPayment: number;
  convAnnualDebtService: number;
  convDscr: number;
  convNetToBuyer: number;
  convRoi: number;
  convTotalEquity: number;
  // Seller financing scenario
  sellerDownPayment: number;
  sellerLoanAmount: number;
  sellerMonthlyPayment: number;
  sellerAnnualDebtService: number;
  sellerDscr: number;
  sellerNetToBuyer: number;
  sellerRoi: number;
  sellerTotalEquity: number;
}

export function calcBusiness(inputs: BusinessInputs): BusinessResults {
  const askingMultiple = inputs.sdeCashFlow > 0 ? inputs.purchasePrice / inputs.sdeCashFlow : 0;
  const simplePayback = inputs.sdeCashFlow > 0 ? inputs.purchasePrice / inputs.sdeCashFlow : 0;

  // SBA 7(a) scenario: typically 10% down for acquisitions
  const sbaDownPct = Math.max(10, inputs.downPaymentPct);
  const sbaDownPayment = inputs.purchasePrice * (sbaDownPct / 100);
  const sbaLoanAmount = inputs.purchasePrice - sbaDownPayment;
  const sbaGuaranteeFee = sbaLoanAmount * (inputs.sbaGuaranteePct / 100);
  const sbaMonthlyPayment = calcMortgagePayment(sbaLoanAmount + sbaGuaranteeFee, inputs.interestRate + 2.75, inputs.loanTerm);
  const sbaAnnualDebtService = sbaMonthlyPayment * 12;
  const sbaDscr = sbaAnnualDebtService > 0 ? inputs.sdeCashFlow / sbaAnnualDebtService : 0;
  const sbaNetToBuyer = inputs.sdeCashFlow - inputs.ownerReplacementSalary - sbaAnnualDebtService;
  const sbaTotalEquity = sbaDownPayment + inputs.workingCapital + inputs.cleanupCosts + sbaGuaranteeFee;
  const sbaRoi = sbaTotalEquity > 0 ? (sbaNetToBuyer / sbaTotalEquity) * 100 : 0;

  // Conventional scenario
  const convDownPayment = inputs.purchasePrice * (inputs.downPaymentPct / 100);
  const convLoanAmount = inputs.purchasePrice - convDownPayment;
  const convMonthlyPayment = calcMortgagePayment(convLoanAmount, inputs.interestRate, inputs.loanTerm);
  const convAnnualDebtService = convMonthlyPayment * 12;
  const convDscr = convAnnualDebtService > 0 ? inputs.sdeCashFlow / convAnnualDebtService : 0;
  const convNetToBuyer = inputs.sdeCashFlow - inputs.ownerReplacementSalary - convAnnualDebtService;
  const convTotalEquity = convDownPayment + inputs.workingCapital + inputs.cleanupCosts;
  const convRoi = convTotalEquity > 0 ? (convNetToBuyer / convTotalEquity) * 100 : 0;

  // Seller financing scenario
  const sellerDownPayment = inputs.purchasePrice * (inputs.downPaymentPct / 100);
  const sellerLoanAmount = inputs.sellerFinancingAmount > 0
    ? inputs.sellerFinancingAmount
    : inputs.purchasePrice - sellerDownPayment;
  const sellerMonthlyPayment = calcMortgagePayment(
    sellerLoanAmount,
    inputs.sellerFinancingRate > 0 ? inputs.sellerFinancingRate : inputs.interestRate,
    inputs.sellerFinancingTerm > 0 ? inputs.sellerFinancingTerm : inputs.loanTerm
  );
  const sellerAnnualDebtService = sellerMonthlyPayment * 12;
  const sellerDscr = sellerAnnualDebtService > 0 ? inputs.sdeCashFlow / sellerAnnualDebtService : 0;
  const sellerNetToBuyer = inputs.sdeCashFlow - inputs.ownerReplacementSalary - sellerAnnualDebtService;
  const sellerTotalEquity = sellerDownPayment + inputs.workingCapital + inputs.cleanupCosts;
  const sellerRoi = sellerTotalEquity > 0 ? (sellerNetToBuyer / sellerTotalEquity) * 100 : 0;

  return {
    askingMultiple,
    simplePayback,
    sbaDownPayment, sbaLoanAmount, sbaGuaranteeFee, sbaMonthlyPayment,
    sbaAnnualDebtService, sbaDscr, sbaNetToBuyer, sbaRoi, sbaTotalEquity,
    convDownPayment, convLoanAmount, convMonthlyPayment,
    convAnnualDebtService, convDscr, convNetToBuyer, convRoi, convTotalEquity,
    sellerDownPayment, sellerLoanAmount, sellerMonthlyPayment,
    sellerAnnualDebtService, sellerDscr, sellerNetToBuyer, sellerRoi, sellerTotalEquity,
  };
}
