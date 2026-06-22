import { useMemo, useState } from "react";

export default function MortgageCalculator({ propertyPrice }) {
  const [price, setPrice] = useState(Number(propertyPrice || 0));
  const [downPayment, setDownPayment] = useState("");
  const [interestRate, setInterestRate] = useState("18");
  const [years, setYears] = useState("10");

  const monthlyPayment = useMemo(() => {
    const principal = Number(price || 0) - Number(downPayment || 0);
    const annualRate = Number(interestRate || 0);
    const loanYears = Number(years || 0);

    if (principal <= 0 || annualRate <= 0 || loanYears <= 0) {
      return 0;
    }

    const monthlyRate = annualRate / 100 / 12;
    const totalMonths = loanYears * 12;

    return (
      (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1)
    );
  }, [price, downPayment, interestRate, years]);

  return (
    <div className="rounded-2xl border bg-slate-50 p-5">
      <h2 className="text-2xl font-bold text-slate-900">
        Mortgage Calculator
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Estimate monthly payment for this property.
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Property Price
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Down Payment
          </label>
          <input
            type="number"
            value={downPayment}
            onChange={(e) => setDownPayment(e.target.value)}
            placeholder="Example: 5000000"
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Interest Rate (% yearly)
          </label>
          <input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Loan Term (Years)
          </label>
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div className="rounded-xl bg-purple-700 p-4 text-white">
          <p className="text-sm opacity-90">Estimated Monthly Payment</p>
          <p className="mt-1 text-2xl font-bold">
            ₦{Number(monthlyPayment || 0).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </p>
        </div>
      </div>
    </div>
  );
}