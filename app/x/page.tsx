"use client";
import { useMemo, useState } from "react";
import { newScheduledAfterExtraOnce, simulateScheduleKeepTerm } from "../../lib/functions";

export default function Demo() {
    const [principal, setPrincipal] = useState<number>(3500000);
    const [rate, setRate] = useState<number>(4.5);
    const [months, setMonths] = useState<number>(30 * 12);
    const [extra, setExtra] = useState<number>(10000);

    const nextTerm = useMemo(
        () => newScheduledAfterExtraOnce(principal, rate, months, extra),
        [principal, rate, months, extra]
    );
    const sim = useMemo(
        () => simulateScheduleKeepTerm(principal, rate, months, extra).slice(0, 12),
        [principal, rate, months, extra]
    ); // viser 12 rader

    return (
        <div>
            <div>Ny termin etter første ekstrabetaling: {Math.round(nextTerm).toLocaleString("no-NB")} kr</div>
            <h4>Eksempel (første 12 måneder)</h4>
            <table>
                <thead>
                    <tr>
                        <th>Mnd</th>
                        <th>Før termin</th>
                        <th>Rente</th>
                        <th>Avdrag</th>
                        <th>Ekstra</th>
                        <th>Ny termin</th>
                        <th>Rest</th>
                    </tr>
                </thead>
                <tbody>
                    {sim.map((r) => (
                        <tr key={r.month}>
                            <td>{r.month}</td>
                            <td>{Math.round(r.beforeScheduled).toLocaleString("no-NB")}</td>
                            <td>{Math.round(r.interest).toLocaleString("no-NB")}</td>
                            <td>{Math.round(r.principalPaid).toLocaleString("no-NB")}</td>
                            <td>{Math.round(r.extraPaid).toLocaleString("no-NB")}</td>
                            <td>{Math.round(r.nextScheduled).toLocaleString("no-NB")}</td>
                            <td>{Math.round(r.remainingAfter).toLocaleString("no-NB")}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
