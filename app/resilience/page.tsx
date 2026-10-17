'use client';

import React, { useState } from 'react';

// Replace with your Supabase client if you want to store submissions
// import { supabase } from '@/lib/supabaseClient';

interface TriageResult {
    title: string;
    practitioner: string;
    description: string;
    benefitsNote: string;
    janeUrl: string;
}

export default function ResilienceTriage() {
    const [step, setStep] = useState<number>(1);
    const [primaryGoal, setPrimaryGoal] = useState<string>('');
    const [subDetail, setSubDetail] = useState<string>('');
    const [leadName, setLeadName] = useState<string>('');
    const [leadContact, setLeadContact] = useState<string>('');
    const [result, setResult] = useState<TriageResult | null>(null);

    const JANE_BASE = 'https://resiliencephysiotherapy.janeapp.com';

    const handleGoalSelect = (goalKey: string) => {
        setPrimaryGoal(goalKey);
        setStep(2);
    };

    const handleEvaluation = (detail: string) => {
        setSubDetail(detail);

        // Decision Logic Engine
        if (primaryGoal === 'pelvic') {
            setResult({
                title: 'Pelvic Health Physiotherapy Assessment',
                practitioner: 'Shannon Vanderschuren, PT & Pelvic Associates',
                description: 'Comprehensive 60-minute 1-on-1 pelvic floor & core evaluation. Focuses on symptom origins, internal/external tone, and tailored rehab without generic exercises.',
                benefitsNote: 'Billed under Registered Physiotherapy extended health benefits (EHC).',
                janeUrl: `${JANE_BASE}/#discipline/1/treatment/1`,
            });
        } else if (primaryGoal === 'pilates') {
            setResult({
                title: 'Clinical Pilates Initial Assessment',
                practitioner: 'Shannon Vanderschuren, PT',
                description: 'Movement retraining and core integration utilizing Pilates equipment (Reformer/Mat), guided 1-on-1 by a registered physiotherapist.',
                benefitsNote: 'Fully covered under Physiotherapy extended health insurance.',
                janeUrl: `${JANE_BASE}/#discipline/1/treatment/2`,
            });
        } else if (primaryGoal === 'sports') {
            setResult({
                title: 'Orthopedic & Sports Injury Assessment',
                practitioner: 'Orthopedic Physical Therapy Team',
                description: 'Biomechanical gait, joint, and muscular load assessment for runners, lifters, and active Annex residents.',
                benefitsNote: 'Direct billing available through Telus Health, Sun Life, and Manulife.',
                janeUrl: `${JANE_BASE}/#discipline/1`,
            });
        } else {
            setResult({
                title: 'Postural Spine & Chiropractic Evaluation',
                practitioner: 'Spine & Manual Therapy Team',
                description: 'Targeted assessment for thoracic tension, cervical strain ("tech-neck"), and joint mobility restoration.',
                benefitsNote: 'Eligible under Chiropractic or Physiotherapy benefit pools.',
                janeUrl: `${JANE_BASE}/#discipline/2`,
            });
        }

        setStep(3);
    };

    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Optional: Log lead to Supabase before redirecting
        /*
        if (supabase) {
          await supabase.from('leads').insert([
            {
              clinic: 'Resilience Physiotherapy',
              name: leadName,
              contact: leadContact,
              goal: primaryGoal,
              detail: subDetail,
            }
          ]);
        }
        */

        if (result?.janeUrl) {
            window.location.href = result.janeUrl;
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">

                {/* Header Bar */}
                <div className="bg-emerald-900 text-white p-6 text-center">
                    <p className="text-xs uppercase tracking-widest text-emerald-300 font-semibold mb-1">
                        Resilience Physiotherapy • 738 Spadina Ave #200
                    </p>
                    <h1 className="text-xl font-bold">Clinical Care Concierge</h1>
                    <p className="text-sm text-emerald-100 mt-1">
                        Match with the exact Annex specialist for your symptoms in 30 seconds
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-emerald-950/60 rounded-full h-1.5 mt-4">
                        <div
                            className="bg-emerald-400 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Form Body */}
                <div className="p-6">
                    {/* STEP 1: Primary Category */}
                    {step === 1 && (
                        <div>
                            <h2 className="text-base font-semibold text-slate-800 mb-3">
                                1. What is your primary health or recovery goal?
                            </h2>
                            <div className="space-y-3">
                                {[
                                    { key: 'pelvic', label: 'Pelvic Floor / Postpartum / Prenatal Care' },
                                    { key: 'pilates', label: 'Clinical Pilates & 1-on-1 Core Retraining' },
                                    { key: 'sports', label: 'Running Overuse, Sports Strain, or Sprain' },
                                    { key: 'posture', label: 'Desk Posture, Tech-Neck, or Chronic Back Tension' },
                                ].map((item) => (
                                    <button
                                        key={item.key}
                                        onClick={() => handleGoalSelect(item.key)}
                                        className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50 transition text-sm font-medium text-slate-700 flex justify-between items-center"
                                    >
                                        <span>{item.label}</span>
                                        <span className="text-emerald-700 font-bold">→</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Clinical Details */}
                    {step === 2 && (
                        <div>
                            <h2 className="text-base font-semibold text-slate-800 mb-3">
                                2. How long have you experienced these symptoms?
                            </h2>
                            <div className="space-y-3">
                                {[
                                    'Acute flare-up or new injury (within the past 2 weeks)',
                                    'Persistent or recurring discomfort (over 1 month)',
                                    'Postpartum recovery or prenatal preparation',
                                    'Looking for preventive performance / core conditioning',
                                ].map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => handleEvaluation(option)}
                                        className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50 transition text-sm font-medium text-slate-700 flex justify-between items-center"
                                    >
                                        <span>{option}</span>
                                        <span className="text-emerald-700 font-bold">→</span>
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setStep(1)}
                                className="mt-4 text-xs text-slate-400 hover:text-slate-600"
                            >
                                ← Back
                            </button>
                        </div>
                    )}

                    {/* STEP 3: Prescribed Match & Jane Redirection */}
                    {step === 3 && result && (
                        <div>
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-5">
                                <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-800 bg-emerald-200/70 px-2 py-0.5 rounded">
                                    Recommended Treatment Match
                                </span>
                                <h3 className="text-lg font-bold text-emerald-950 mt-1">{result.title}</h3>
                                <p className="text-xs font-semibold text-emerald-700 mb-2">Lead Clinician: {result.practitioner}</p>
                                <p className="text-xs text-slate-600 leading-relaxed mb-3">{result.description}</p>
                                <div className="text-[11px] bg-white border border-emerald-200 rounded p-2 text-emerald-900 font-medium">
                                    💳 <strong>Insurance Note:</strong> {result.benefitsNote}
                                </div>
                            </div>

                            {/* Optional Lead Capture Form */}
                            <form onSubmit={handleFinalSubmit} className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Your Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Sarah Jenkins"
                                        value={leadName}
                                        onChange={(e) => setLeadName(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Email or Phone (for appointment details)</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="sarah@example.com or 416-xxx-xxxx"
                                        value={leadContact}
                                        onChange={(e) => setLeadContact(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full mt-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium py-3 rounded-lg text-sm shadow transition"
                                >
                                    Select Time Slot on Jane App →
                                </button>
                            </form>

                            <button
                                onClick={() => setStep(2)}
                                className="mt-4 text-xs text-slate-400 hover:text-slate-600 block text-center w-full"
                            >
                                ← Change answers
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}