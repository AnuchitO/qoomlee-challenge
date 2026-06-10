import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export interface InsurancePlan {
  id: string;
  name: string;
  price: number;
  featured: boolean;
  benefits: string[];
  exclusions: string[];
}

export const INSURANCE_PLANS: InsurancePlan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 290,
    featured: false,
    benefits: [
      "Trip cancellation up to ฿10,000",
      "Medical emergency up to ฿50,000",
      "Lost baggage up to ฿5,000",
      "Flight delay ≥ 4 hours",
    ],
    exclusions: ["Adventure sports — not covered"],
  },
  {
    id: "comprehensive",
    name: "Comprehensive",
    price: 590,
    featured: true,
    benefits: [
      "All Basic coverage plus:",
      "Trip cancellation up to ฿50,000",
      "Medical emergency up to ฿500,000",
      "Lost baggage up to ฿20,000",
      "Adventure sports covered",
      "Pre-existing conditions (declared)",
      "24/7 emergency assistance",
    ],
    exclusions: [],
  },
  {
    id: "premium",
    name: "Premium Plus",
    price: 990,
    featured: false,
    benefits: [
      "All Comprehensive coverage plus:",
      "Unlimited medical emergency",
      "Repatriation covered",
      "COVID-19 coverage",
      "Rental car damage",
      "Cancel for any reason",
    ],
    exclusions: [],
  },
];

export function useTravelInsurance() {
  const { ref } = useParams<{ ref: string }>();
  const router = useRouter();
  const [selected, setSelected] = useState("comprehensive");

  function selectPlan(planId: string) {
    setSelected(planId);
  }

  function handleAddInsurance() {
    router.push(`/bookings/${ref}`);
  }

  const selectedPrice = INSURANCE_PLANS.find((p) => p.id === selected)?.price ?? 0;

  return { ref, plans: INSURANCE_PLANS, selected, selectPlan, selectedPrice, handleAddInsurance };
}
