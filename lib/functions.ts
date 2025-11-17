// loanUtils.ts
export type ScheduleRow = {
    month: number;
    beforeScheduled: number; // termin før ekstrabetaling (for den måneden)
    interest: number;
    principalPaid: number; // avdrag fra ordinær termin
    extraPaid: number; // ekstra betalt denne måneden
    remainingAfter: number; // rest etter betalingene
    nextScheduled: number; // ny termin for neste måned (gitt at løpetid beholdes)
};

/**
 * Beregn månedlig termin (ordinær) for et gitt beløp, månedlig rente og antall måneder.
 * Håndterer rente = 0.
 */
export function monthlyPayment(principal: number, monthlyRate: number, months: number): number {
    if (months <= 0) return 0;
    if (monthlyRate === 0) return principal / months;
    return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
}

/**
 * Beregn nytt terminbeløp etter én måneds betaling hvor du betaler ordinær termin + ekstra.
 *
 * @param remainingPrincipal - nåværende restgjeld (kr)
 * @param annualRatePct - årlig nominell rente i prosent (f.eks. 4.5)
 * @param remainingMonths - antall terminer/måneder igjen (f.eks. 360 for 30 år)
 * @param extraPerMonth - hvor mye ekstra du betaler denne måneden (kr)
 * @returns ny termin (kr) som skal betales fra neste måned for å beholde samme slutt-tidspunkt
 */
export function newScheduledAfterExtraOnce(
    remainingPrincipal: number,
    annualRatePct: number,
    remainingMonths: number,
    extraPerMonth: number
): number {
    if (remainingPrincipal <= 0) return 0;
    if (remainingMonths <= 0) return 0;

    const monthlyRate = annualRatePct / 100 / 12;
    // dagens ordinære termin basert på gjeldende rest og resterende måneder
    const currentScheduled = monthlyPayment(remainingPrincipal, monthlyRate, remainingMonths);

    // renten denne måneden
    const interest = remainingPrincipal * monthlyRate;
    // avdrag fra ordinær termin (kan ikke være negativ)
    const principalPaid = Math.min(Math.max(currentScheduled - interest, 0), remainingPrincipal);

    // bruk ekstra (kan ikke overskride rest)
    const extraApplied = Math.min(extraPerMonth, Math.max(remainingPrincipal - principalPaid, 0));

    // rest etter begge betalingene
    const remainingAfter = Math.max(remainingPrincipal - principalPaid - extraApplied, 0);

    // måneder igjen etter denne måneden
    const monthsLeft = Math.max(remainingMonths - 1, 0);

    // ny termin fra neste måned (hvis monthsLeft === 0, ingen termin)
    const nextScheduled = monthsLeft > 0 ? monthlyPayment(remainingAfter, monthlyRate, monthsLeft) : 0;

    return nextScheduled;
}

/**
 * Simuler måned-for-måned hvor du hver måned betaler ordinær termin (beregnet ut fra gjeldende rest og gjenværende måneder)
 * + ekstraPerMonth, men du beholder det samme totale antallet terminer. Returnerer array med data per måned.
 *
 * Merk: Simuleringen stopper når rest = 0 eller når månedene er brukt opp.
 */
export function simulateScheduleKeepTerm(
    startingPrincipal: number,
    annualRatePct: number,
    totalMonths: number,
    extraPerMonth: number,
    incomePerMonth: number,
    otherExpensesPerMonth: number,
    maxRows = 1000
): ScheduleRow[] {
    const rows: ScheduleRow[] = [];
    if (startingPrincipal <= 0 || totalMonths <= 0) return rows;

    const monthlyRate = annualRatePct / 100 / 12;
    let remaining = startingPrincipal;
    let monthsLeft = totalMonths;

    for (let m = 1; m <= totalMonths && remaining > 0 && rows.length < maxRows; m++) {
        const beforeScheduled = monthlyPayment(remaining, monthlyRate, monthsLeft);
        const interest = remaining * monthlyRate;
        const principalPaid = Math.min(Math.max(beforeScheduled - interest, 0), remaining);

        const expenses = principalPaid + interest;
        const income = incomePerMonth - expenses - otherExpensesPerMonth;

        const ex = income > 0 ? income + extraPerMonth : extraPerMonth;

        const extraApplied = Math.min(ex, Math.max(remaining - principalPaid, 0));

        remaining = Math.max(remaining - principalPaid - extraApplied, 0);
        const nextMonthsLeft = Math.max(monthsLeft - 1, 0);
        const nextScheduled = nextMonthsLeft > 0 ? monthlyPayment(remaining, monthlyRate, nextMonthsLeft) : 0;

        rows.push({
            month: m,
            beforeScheduled,
            interest,
            principalPaid,
            extraPaid: extraApplied,
            remainingAfter: remaining,
            nextScheduled,
        });

        monthsLeft = nextMonthsLeft;
    }

    return rows;
}
