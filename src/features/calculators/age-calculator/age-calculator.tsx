"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ResultCard } from "@/components/ui/result-card";
import { formatNumber } from "@/lib/utils";
import { getAgeFromInput } from "./logic";

export function AgeCalculator() {
  const [dob, setDob] = useState("");

  const result = useMemo(() => getAgeFromInput(dob), [dob]);

  return (
    <div className="space-y-6">
      <Card>
        <Input
          label="Date of birth"
          type="date"
          name="dob"
          value={dob}
          max={new Date().toISOString().split("T")[0]}
          onChange={(e) => setDob(e.target.value)}
        />
      </Card>

      {result && (
        <ResultCard title="Your age">
          <p className="text-2xl font-bold">
            {result.years} <span className="text-base font-normal">years</span>{" "}
            {result.months} <span className="text-base font-normal">months</span>{" "}
            {result.days} <span className="text-base font-normal">days</span>
          </p>
          <p className="mt-2 text-sm text-gray-600">
            That&apos;s <strong>{formatNumber(result.totalDays)}</strong> total days.
          </p>
        </ResultCard>
      )}

      {!result && dob && (
        <p className="text-sm text-red-500">
          Please pick a valid date in the past.
        </p>
      )}

      {!dob && (
        <p className="text-sm text-gray-500">
          Pick a date above to see your exact age.
        </p>
      )}
    </div>
  );
}