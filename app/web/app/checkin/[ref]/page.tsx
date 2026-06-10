"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type Tab = "personal" | "baggage" | "seats" | "extras";

const TABS: { id: Tab; label: string }[] = [
  { id: "personal", label: "Personal Details" },
  { id: "baggage", label: "Baggage" },
  { id: "seats", label: "Seat Selection" },
  { id: "extras", label: "Extras" },
];

export default function CheckInDetailsPage() {
  const { ref } = useParams<{ ref: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("baggage");
  const [bags, setBags] = useState(1);
  const [carryOnConfirmed, setCarryOnConfirmed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-surface-container-low border-b border-outline-variant shadow-sm sticky top-0 z-50 flex items-center justify-between px-container-margin-mobile h-16">
        <div className="flex items-center gap-md">
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            flight_takeoff
          </span>
          <h1 className="text-headline-md text-primary tracking-tight">Qoomlee Airline</h1>
        </div>
        <div className="flex items-center gap-md">
          <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">help_outline</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbQ_XwjmT3nQVZtKrch7NWDiSTPUL-q44fRlURVa5KfhNZaH0dxy82ic4hUenos1ZZY_aEQ2IPRhThcMK3zMIzMuiEdtEGe4Iiz_TfPSM3F5dlkLdyuwIA6JJjmtM6lpikcIj-N4vDa6kyQprjMGh3Lul2reod_bHp6WgonwIR8HDKCdJq60mS_bOIeGn-ivSUui-9mIxbX37XgGkBGfde0naGFq4mtaIozJRUXY1lr80mbHdjI5xvTTZ2JvJn93nxZcbyJYvWfCA"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex overflow-x-auto bg-surface-bright border-b border-outline-variant sticky top-16 z-40">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-md py-4 text-label-md transition-colors ${
              activeTab === tab.id
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <main className="pb-32 max-w-[600px] mx-auto w-full px-container-margin-mobile py-lg space-y-lg">
        {activeTab === "personal" && (
          <section className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant space-y-md">
            <div className="flex items-center gap-md">
              <span className="material-symbols-outlined text-primary text-[32px]">person</span>
              <h3 className="text-headline-md">Personal Details</h3>
            </div>
            <div className="grid grid-cols-2 gap-md">
              {[
                { label: "First Name", value: "Jonathan" },
                { label: "Last Name", value: "Doe" },
                { label: "Date of Birth", value: "15 Mar 1985" },
                { label: "Nationality", value: "Thai" },
                { label: "Passport No.", value: "AA123456" },
                { label: "Expiry Date", value: "31 Dec 2030" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-label-sm text-on-surface-variant">{label}</p>
                  <p className="text-label-md text-on-surface">{value}</p>
                </div>
              ))}
            </div>
            <button className="text-primary text-label-md flex items-center gap-xs hover:underline">
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit details
            </button>
          </section>
        )}

        {activeTab === "baggage" && (
          <>
            <section className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant">
              <div className="flex items-center gap-md mb-md">
                <span className="material-symbols-outlined text-primary text-[32px]">luggage</span>
                <h3 className="text-headline-md">Checked Baggage</h3>
              </div>
              <p className="text-body-md text-on-surface-variant mb-lg">
                How many bags will you be checking in? Each bag has a maximum weight limit of 23kg.
              </p>
              <div className="flex items-center justify-between p-md bg-surface-container-low rounded-lg border border-outline-variant">
                <div>
                  <span className="text-label-md text-on-surface">Standard Checked Bag</span>
                  <span className="block text-label-sm text-on-surface-variant">
                    Max 23kg per bag
                  </span>
                </div>
                <div className="flex items-center gap-md">
                  <button
                    onClick={() => setBags((b) => Math.max(0, b - 1))}
                    className="w-10 h-10 rounded-full border border-primary flex items-center justify-center text-primary active:scale-90 transition-transform"
                  >
                    <span className="material-symbols-outlined">remove</span>
                  </button>
                  <span className="text-headline-md text-on-surface w-6 text-center">{bags}</span>
                  <button
                    onClick={() => setBags((b) => Math.min(4, b + 1))}
                    className="w-10 h-10 rounded-full border border-primary flex items-center justify-center text-primary active:scale-90 transition-transform"
                  >
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              </div>
              <div className="mt-lg p-md bg-tertiary-container/10 border border-tertiary-container/20 rounded-lg flex gap-md">
                <span className="material-symbols-outlined text-tertiary">info</span>
                <p className="text-label-sm text-on-tertiary-fixed-variant">
                  Extra weight (up to 32kg) or additional bags can be purchased at the airport, but
                  higher rates may apply.
                </p>
              </div>
            </section>

            <section className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant">
              <div className="flex items-center gap-md mb-md">
                <span className="material-symbols-outlined text-primary text-[32px]">backpack</span>
                <h3 className="text-headline-md">Carry-on Baggage</h3>
              </div>
              <p className="text-body-md text-on-surface-variant mb-lg">
                Please confirm that your carry-on luggage meets our size and weight requirements.
              </p>
              <label className="flex items-start gap-md p-md bg-surface-container-low rounded-lg border border-outline-variant cursor-pointer hover:bg-surface-container transition-colors">
                <input
                  type="checkbox"
                  checked={carryOnConfirmed}
                  onChange={(e) => setCarryOnConfirmed(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-outline text-primary focus:ring-primary"
                />
                <div>
                  <span className="text-label-md text-on-surface">
                    I confirm my carry-on bag is within 7kg
                  </span>
                  <span className="block text-label-sm text-on-surface-variant">
                    Must fit in the overhead locker or under the seat in front of you.
                  </span>
                </div>
              </label>
            </section>
          </>
        )}

        {activeTab === "seats" && (
          <section className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant space-y-md">
            <div className="flex items-center gap-md">
              <span className="material-symbols-outlined text-primary text-[32px]">event_seat</span>
              <h3 className="text-headline-md">Seat Selection</h3>
            </div>
            <p className="text-body-md text-on-surface-variant">
              Choose your preferred seat for this flight.
            </p>
            <div className="flex items-center justify-between p-md bg-primary-container/20 rounded-xl border border-primary/20">
              <div>
                <p className="text-label-sm text-on-surface-variant">Current Seat</p>
                <p className="text-headline-md text-primary">14A</p>
                <p className="text-label-sm text-on-surface-variant">Economy · Window</p>
              </div>
              <button
                onClick={() => router.push(`/checkin/${ref}/seats`)}
                className="px-md py-sm bg-primary text-on-primary text-label-md rounded-xl active:scale-95 transition-all"
              >
                Change Seat
              </button>
            </div>
          </section>
        )}

        {activeTab === "extras" && (
          <section className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant space-y-md">
            <div className="flex items-center gap-md">
              <span className="material-symbols-outlined text-primary text-[32px]">star</span>
              <h3 className="text-headline-md">Special Requests</h3>
            </div>
            {[
              { icon: "restaurant", label: "Meal Preference", value: "Standard meal" },
              { icon: "accessible", label: "Special Assistance", value: "None requested" },
              { icon: "local_pharmacy", label: "Medical Equipment", value: "None requested" },
            ].map(({ icon, label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between p-md bg-surface-container-low rounded-lg border border-outline-variant"
              >
                <div className="flex items-center gap-md">
                  <span className="material-symbols-outlined text-outline">{icon}</span>
                  <div>
                    <p className="text-label-md text-on-surface">{label}</p>
                    <p className="text-label-sm text-on-surface-variant">{value}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline">chevron_right</span>
              </div>
            ))}
          </section>
        )}
      </main>

      {/* Bottom action */}
      <div className="fixed bottom-0 left-0 w-full bg-surface-bright border-t border-outline-variant px-container-margin-mobile py-md shadow-lg z-50">
        <button
          onClick={() => router.push(`/passes/${ref}`)}
          className="w-full h-14 bg-primary text-on-primary text-label-md rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all duration-150 flex items-center justify-center gap-sm"
        >
          Complete Check-in
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
        </button>
      </div>
    </div>
  );
}
