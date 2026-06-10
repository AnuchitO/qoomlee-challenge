"use client";

import { useState } from "react";
import Link from "next/link";
import TopAppBar from "../components/TopAppBar";
import BottomNav from "../components/BottomNav";

const FAQ = [
  {
    question: "How do I cancel my booking?",
    answer:
      "You can cancel your booking through 'Manage Booking' in the app. Refunds are processed within 7-10 business days depending on your fare type.",
  },
  {
    question: "What is the baggage allowance?",
    answer:
      "Economy class allows 1 carry-on bag (7kg) and 1 checked bag (23kg). Business class allows 2 checked bags (32kg each).",
  },
  {
    question: "How early can I check in online?",
    answer:
      "Online check-in opens 48 hours before departure and closes 1 hour before for domestic flights, 2 hours before for international.",
  },
  {
    question: "Can I change my flight?",
    answer:
      "Yes, you can change your flight up to 24 hours before departure. Change fees may apply depending on your fare class.",
  },
];

const TOPICS = ["Booking", "Check-in", "Baggage", "Refunds", "Special assistance"];

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [activeTopic, setActiveTopic] = useState("Booking");

  const filteredFaq = FAQ.filter(
    (f) =>
      !searchQuery ||
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <TopAppBar />
      <main className="pb-28 md:pb-8 max-w-[28rem] mx-auto md:max-w-4xl px-container-margin-mobile md:px-container-margin-desktop">
        {/* Search */}
        <section className="mt-lg">
          <div className="relative flex items-center h-12 border border-outline-variant rounded-xl bg-surface-bright focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <span className="material-symbols-outlined text-outline absolute left-4">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help topics..."
              className="w-full pl-12 pr-md h-full bg-transparent outline-none text-body-md"
            />
          </div>
        </section>

        {/* Topics */}
        <section className="flex gap-sm overflow-x-auto py-md custom-scrollbar">
          {TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => setActiveTopic(topic)}
              className={`whitespace-nowrap px-md py-2 rounded-full text-label-md transition-colors border ${
                activeTopic === topic
                  ? "bg-primary-container text-on-primary-container border-primary/20"
                  : "bg-surface-container border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {topic}
            </button>
          ))}
        </section>

        {/* Live support card */}
        <section className="mt-sm bg-secondary text-on-secondary rounded-xl p-lg shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-md mb-md">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-white text-[28px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  support_agent
                </span>
              </div>
              <div>
                <h3 className="text-label-md text-white font-bold">Live Support</h3>
                <p className="text-label-sm text-white/70">Avg. wait: 2 minutes</p>
              </div>
              <div className="ml-auto flex items-center gap-xs">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-label-sm text-white/80">3 agents online</span>
              </div>
            </div>
            <button className="w-full h-12 bg-surface-container-lowest text-on-surface text-label-md py-3 rounded-xl shadow-sm hover:bg-surface-container-lowest/90 transition-all active:scale-95 flex items-center justify-center gap-sm">
              <span className="material-symbols-outlined text-[20px]">forum</span>
              Start Chat
            </button>
          </div>
        </section>

        {/* Contact options */}
        <section className="mt-lg bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
          {[
            { icon: "phone", label: "Call us", sub: "+66 2 000 0000 · 24/7" },
            { icon: "email", label: "Email support", sub: "Typical response within 24 hours" },
            { icon: "chat", label: "WhatsApp", sub: "Chat on mobile" },
          ].map(({ icon, label, sub }, i) => (
            <div key={label}>
              {i > 0 && <div className="h-px bg-outline-variant mx-md" />}
              <button className="w-full flex items-center justify-between p-md hover:bg-surface-container-low transition-colors group active:bg-surface-container">
                <div className="flex items-center gap-md">
                  <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">{icon}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-label-md text-on-surface">{label}</p>
                    <p className="text-label-sm text-outline">{sub}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">
                  chevron_right
                </span>
              </button>
            </div>
          ))}
        </section>

        {/* FAQ */}
        <section className="mt-xl space-y-sm">
          <h2 className="text-headline-md text-on-surface mb-md">Frequently Asked Questions</h2>
          {filteredFaq.map((faq, i) => (
            <div
              key={i}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-md hover:bg-surface-container-low transition-colors"
              >
                <span className="text-label-md text-on-surface text-left">{faq.question}</span>
                <span
                  className={`material-symbols-outlined text-on-surface-variant transition-transform ${
                    expandedFaq === i ? "rotate-180" : ""
                  }`}
                >
                  expand_more
                </span>
              </button>
              {expandedFaq === i && (
                <div className="px-md pb-md text-body-md text-on-surface-variant">{faq.answer}</div>
              )}
            </div>
          ))}
        </section>

        {/* Verified/security note */}
        <section className="mt-xl flex items-center gap-md p-md bg-surface-container-low rounded-xl">
          <span
            className="material-symbols-outlined text-primary text-[32px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            verified_user
          </span>
          <p className="text-label-sm text-on-surface-variant">
            All support interactions are secure and encrypted. Your data is safe with us.
          </p>
        </section>
      </main>
      <BottomNav />
    </>
  );
}
