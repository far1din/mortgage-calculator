"use client";
import { useMemo, useState } from "react";
import { newScheduledAfterExtraOnce, simulateScheduleKeepTerm } from "../../lib/functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
        () => simulateScheduleKeepTerm(principal, rate, months, extra),
        // .slice(0, 12)
        [principal, rate, months, extra]
    );

    const originalSchedule = useMemo(
        () => simulateScheduleKeepTerm(principal, rate, months, 0),
        [principal, rate, months]
    );

    function formatMonths(totalMonths: number): string {
        if (!Number.isFinite(totalMonths)) return "";

        const years = Math.floor(totalMonths / 12);
        const months = totalMonths % 12;

        const parts: string[] = [];

        if (years > 0) parts.push(`${years} year${years === 1 ? "" : "s"}`);
        if (months > 0) parts.push(`${months} month${months === 1 ? "" : "s"}`);

        // If both are zero
        if (parts.length === 0) return "0 months";

        return parts.join(" and ");
    }

    return (
        <div className="container mx-auto p-6 space-y-6 max-w-7xl">
            <div className="grid md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Lånekalkulator</CardTitle>
                        <CardDescription>Beregn ny termin etter ekstrabetalinger</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="principal">Lånebeløp</Label>
                                <kbd className="text-xs text-red-700 px-1 bg-gray-200 ml-2 rounded font-semibold">
                                    {principal.toLocaleString("no-NB")} kr
                                </kbd>
                                <Input
                                    id="principal"
                                    type="number"
                                    value={principal}
                                    onChange={(e) => setPrincipal(Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rate">Rente (%)</Label>
                                <kbd className="text-xs text-gray-900 px-1 bg-gray-200 ml-2 rounded">{rate}</kbd>
                                <Input
                                    id="rate"
                                    type="number"
                                    step="0.1"
                                    value={rate}
                                    onChange={(e) => setRate(Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="months">Løpetid (måneder)</Label>
                                <kbd className="text-xs text-lime-700 px-1 bg-gray-200 ml-2 rounded font-semibold">
                                    {formatMonths(months)}
                                </kbd>
                                <Input
                                    id="months"
                                    type="number"
                                    value={months}
                                    onChange={(e) => setMonths(Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="extra">Ekstrabetaling</Label>
                                <kbd className="text-xs text-lime-700 px-1 bg-gray-200 ml-2 rounded font-semibold">
                                    {extra.toLocaleString("no-NB")} kr
                                </kbd>
                                <Input
                                    id="extra"
                                    type="number"
                                    value={extra}
                                    onChange={(e) => setExtra(Number(e.target.value))}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Stats</CardTitle>
                        <CardDescription>Statistikk over lånet</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="principal">Løpetid</Label>
                                <kbd className="text-xs text-red-700 px-1 bg-gray-200 ml-2 rounded font-semibold">
                                    {formatMonths(originalSchedule.length - sim.length)}
                                </kbd>
                                <p className="text-xl font-semibold">{formatMonths(sim.length)}</p>
                            </div>
                            <div>
                                <Label htmlFor="principal">Renter</Label>
                                <kbd className="text-xs text-red-700 px-1 bg-gray-200 ml-2 rounded font-semibold">
                                    {(
                                        Math.round(originalSchedule.reduce((acc, r) => acc + r.interest, 0)) -
                                        Math.round(sim.reduce((acc, r) => acc + r.interest, 0))
                                    ).toLocaleString("no-NB")}{" "}
                                    kr
                                </kbd>
                                <p className="text-xl font-semibold">
                                    {Math.round(sim.reduce((acc, r) => acc + r.interest, 0)).toLocaleString("no-NB")} kr
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="principal">Avdrag</Label>
                                <p className="text-xl font-semibold">
                                    {Math.round(
                                        sim.reduce((acc, r) => acc + r.principalPaid, 0) +
                                            sim.reduce((acc, r) => acc + r.extraPaid, 0)
                                    ).toLocaleString("no-NB")}{" "}
                                    kr
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Resultat</CardTitle>
                    <CardDescription>
                        Ny termin etter første ekstrabetaling:{" "}
                        <span className="font-semibold text-foreground">
                            {Math.round(nextTerm).toLocaleString("no-NB")} kr
                        </span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Eksempel (første 12 måneder)</h4>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mnd</TableHead>
                                        <TableHead className="text-right">Før termin</TableHead>
                                        <TableHead className="text-right">Rente</TableHead>
                                        <TableHead className="text-right">Avdrag</TableHead>
                                        <TableHead className="text-right">Ekstra</TableHead>
                                        <TableHead className="text-right">Ny termin</TableHead>
                                        <TableHead className="text-right">Rest</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sim.map((r) => (
                                        <TableRow key={r.month}>
                                            <TableCell className="font-medium">{r.month}</TableCell>
                                            <TableCell className="text-right">
                                                {Math.round(r.beforeScheduled).toLocaleString("no-NB")}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {Math.round(r.interest).toLocaleString("no-NB")}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {Math.round(r.principalPaid).toLocaleString("no-NB")}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {Math.round(r.extraPaid).toLocaleString("no-NB")}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {Math.round(r.nextScheduled).toLocaleString("no-NB")}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {Math.round(r.remainingAfter).toLocaleString("no-NB")}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
