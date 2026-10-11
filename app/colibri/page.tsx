"use client";

import React, { useState } from "react";

export default function ColibriTriageDemo() {
    const [step, setStep] = useState(1);
    const [goal, setGoal] = useState("");
    const [downtime, setDowntime] = useState("");
    const [contraindications, setContraindications] = useState({
        retinol: false,
        sunburn: false,
        pregnant: false,
    });

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12">
            {/* Yorkville Header */}
            <div className="mb-10 text-center">
                <span className="text-xs uppercase tracking-[0.3em] text-neutral-400">
                    30A Hazelton Ave · Yorkville
                </span>
                <h1 className="mt-2 text-2xl font-light tracking-wide text-white sm:text-3xl">
                    COLIBRI LASER & BEAUTY
                </h1>
                <p className="mt-1 text-xs tracking-wider text-neutral-400">
                    Clinical Treatment Qualifier & Concierge
                </p>
            </div>

            {/* Main Interactive Card */}
            <div className="w-full max-w-xl rounded-2xl border border-neutral-800 bg-[#161618] p-8 shadow-2xl">
                {/* Step Indicator */}
                <div className="mb-8 flex items-center justify-between border-b border-neutral-800/80 pb-4 text-xs text-neutral-500">
                    <span>STEP {step} OF 4</span>
                    <span>{step === 4 ? "Qualified Match" : "Diagnostic Intake"}</span>
                </div>

                {/* STEP 1 */}
                {step === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-normal text-neutral-100">
                            What is your primary treatment objective?
                        </h2>
                        <div className="grid gap-3">
                            {[
                                "Deep Firming & Skin Tightening",
                                "Pigment Clearance & Sun Damage",
                                "Cellular Rejuvenation (PDRN / Exosomes)",
                                "Facial Balancing & Volume (Injectables)",
                            ].map((option) => (
                                <button
                                    key={option}
                                    onClick={() => {
                                        setGoal(option);
                                        setStep(2);
                                    }}
                                    className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-4 text-left text-sm text-neutral-200 transition-all hover:border-neutral-600 hover:bg-neutral-800"
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-normal text-neutral-100">
                            What is your recovery or event timeline?
                        </h2>
                        <div className="grid gap-3">
                            {[
                                { label: "Zero downtime", desc: "Need immediate radiance for an upcoming event" },
                                { label: "24–48 hours mild recovery", desc: "Comfortable with minor redness" },
                                { label: "Multi-session skin overhaul", desc: "Committed to long-term collagen revision" },
                            ].map((item) => (
                                <button
                                    key={item.label}
                                    onClick={() => {
                                        setDowntime(item.label);
                                        setStep(3);
                                    }}
                                    className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-4 text-left transition-all hover:border-neutral-600 hover:bg-neutral-800"
                                >
                                    <p className="text-sm font-medium text-neutral-200">{item.label}</p>
                                    <p className="text-xs text-neutral-400 mt-1">{item.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-normal text-neutral-100">
                            Pre-Treatment Clinical Safety Check
                        </h2>
                        <div className="space-y-3">
                            {[
                                { id: "retinol", label: "No active retinol / acids in past 5 days" },
                                { id: "sunburn", label: "No direct sunburn or active UV tanning" },
                                { id: "pregnant", label: "Not currently pregnant or nursing" },
                            ].map((item) => (
                                <label
                                    key={item.id}
                                    className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4 text-sm text-neutral-300 cursor-pointer hover:bg-neutral-800/40"
                                >
                                    <input
                                        type="checkbox"
                                        checked={contraindications[item.id as keyof typeof contraindications]}
                                        onChange={(e) =>
                                            setContraindications((prev) => ({
                                                ...prev,
                                                [item.id]: e.target.checked,
                                            }))
                                        }
                                        className="h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-white focus:ring-0"
                                    />
                                    <span>{item.label}</span>
                                </label>
                            ))}
                        </div>
                        <button
                            onClick={() => setStep(4)}
                            className="w-full rounded-lg bg-white py-3.5 text-sm font-medium text-black transition-colors hover:bg-neutral-200"
                        >
                            Generate Recommended Protocol
                        </button>
                    </div>
                )}

                {/* STEP 4: RESULT / OUTCOME */}
                {step === 4 && (
                    <div className="space-y-6">
                        <div className="inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-400">
                            ✓ Qualified Clinical Candidate
                        </div>

                        <div>
                            <h2 className="text-xl font-light text-white">
                                Recommended: Bright & Tight Multi-Session Package ($1,873)
                            </h2>
                            <p className="mt-2 text-xs text-neutral-400">
                                Tailored for {goal || "skin rejuvenation"} with {downtime || "standard recovery"}.
                            </p>
                        </div>

                        <ul className="space-y-2 rounded-lg border border-neutral-800/80 bg-neutral-900/40 p-4 text-xs text-neutral-300">
                            <li>• Directly targets dermal pigment clearance while building deep collagen.</li>
                            <li>• Screened safe for immediate booking based on active topical ingredients.</li>
                            <li>• Backed by Colibri's official 72-hour reschedule policy.</li>
                        </ul>

                        <div className="pt-2">
                            <a
                                href="https://www.fresha.com/a/colibri-laser-and-beauty-toronto-30a-hazelton-avenue-not30t13"
                                target="_blank"
                                rel="noreferrer"
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-3.5 text-sm font-medium text-black transition-colors hover:bg-neutral-200"
                            >
                                Proceed to Fresha Calendar Hold →
                            </a>
                            <p className="mt-3 text-center text-[11px] text-neutral-500">
                                Secures slot on live calendar · Deposit applied directly to treatment
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}