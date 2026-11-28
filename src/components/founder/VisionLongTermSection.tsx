// src/components/founder/VisionLongTermSection.tsx
// Long-term vision: From CV to Career. Text-based, modular, premium.
// All content is clearly presented as vision/direction, not live features.

import { Compass, Rocket, Target, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

// ─────────────────────────────────────────────
// Content data (easy to edit/reorder)
// ─────────────────────────────────────────────
const HERO = {
  eyebrow: "Our Vision",
  title: "From CV to Career",
  subtitle:
    "Building a future where professional potential is not just written on a CV, but demonstrated through real abilities.",
  intro:
    "At Adin AI, we believe a career is more than a document, a qualification, or a list of experiences. It is also about what a person knows, what they can do, and how they apply their abilities in the real world. Our vision is to make professional growth, skill development, and career opportunities more connected.",
};

const PILLARS = [
  {
    id: "foundation",
    step: "01",
    title: "Career Foundation",
    icon: Rocket,
    body: [
      "Every professional journey needs a starting point.",
      "We are developing accessible career tools that help people create professional CVs, prepare cover letters, and communicate their experience and potential more effectively.",
      "But we see this as the beginning, not the destination.",
    ],
  },
  {
    id: "skill-verified",
    step: "02",
    title: "Skill Verified — Beyond Claims, Towards Demonstrated Skills",
    icon: ShieldCheck,
    highlight: true,
    body: [
      "A CV can describe someone's abilities, but describing a skill and demonstrating it are two different things.",
      "Skill Verified is our vision for making professional abilities more visible through practical work and meaningful assessment.",
      "We aim to create opportunities for individuals to demonstrate their knowledge, problem-solving abilities, and practical understanding through relevant work.",
    ],
    quote:
      "Rather than relying only on self-declared skills, the direction is to build a more evidence-based understanding of what someone can actually do.",
    footer: [
      "The goal is to help individuals build a stronger, more credible representation of their abilities — while giving employers better insight into the skills behind a profile.",
      "We also recognize that AI is changing how people work. The future of skill assessment should acknowledge the role of AI while keeping human understanding, contribution, and ability meaningful.",
      "Skill Verified is intended to evolve into a transparent approach to demonstrating skills, not simply another badge or certificate.",
    ],
  },
  {
    id: "connection",
    step: "03",
    title: "Connecting Talent With Opportunity",
    icon: Compass,
    body: [
      "We believe employers should be able to understand more than a candidate's CV.",
      "Our long-term vision is to help connect professional backgrounds, demonstrated abilities, and relevant opportunities in a more meaningful way.",
      "We want candidates to have better ways to present their potential and employers to have better ways to discover talent.",
    ],
  },
  {
    id: "ecosystem",
    step: "04",
    title: "An Evolving Career Ecosystem",
    icon: Target,
    body: [
      "Adin AI is being built with a long-term perspective.",
      "We are starting with practical career tools and exploring how professional profiles, demonstrated skills, and opportunities can work together over time.",
      "The ecosystem will continue to evolve as we learn from candidates, employers, and the changing world of work.",
      "We are not trying to build everything at once. We believe meaningful products are built through real problems, continuous learning, and thoughtful progress.",
    ],
  },
];

const CLOSING = {
  title: "Our Vision",
  line: "A future where people are understood not only by what their CV says, but also by what they can demonstrate.",
  tagline: "Adin AI — From CV to Career.",
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function VisionLongTermSection() {
  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 border-t border-slate-200 bg-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)", filter: "blur(90px)" }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold mb-4">
            <Sparkles size={12} />
            {HERO.eyebrow}
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
            From{" "}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">CV</span>{" "}
            to{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Career</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg font-medium text-slate-700 max-w-2xl mx-auto leading-relaxed">
            {HERO.subtitle}
          </p>
          <p className="mt-5 text-sm sm:text-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {HERO.intro}
          </p>
        </div>

        {/* Pillars */}
        <div className="space-y-5">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                className={`relative rounded-2xl border p-6 sm:p-8 transition-all duration-300 hover:shadow-xl hover:shadow-purple-900/5 hover:-translate-y-0.5 ${
                  pillar.highlight
                    ? "bg-gradient-to-br from-purple-50 via-white to-blue-50 border-purple-200 shadow-md"
                    : "bg-white border-slate-200 shadow-sm hover:border-purple-200"
                }`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md shrink-0 ${
                      pillar.highlight
                        ? "bg-gradient-to-br from-purple-600 to-blue-500 shadow-purple-600/25"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Icon size={22} className={pillar.highlight ? "text-white" : ""} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-purple-600">
                      Step {pillar.step}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug mt-1">
                      {pillar.title}
                    </h3>
                  </div>
                </div>

                <div className="space-y-3 text-sm sm:text-[15px] text-slate-600 leading-relaxed pl-0 sm:pl-16">
                  {pillar.body.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}

                  {pillar.quote && (
                    <blockquote className="relative my-4 pl-4 border-l-4 border-purple-400 bg-purple-50/50 py-3 pr-4 rounded-r-lg">
                      <p className="text-sm sm:text-base font-medium text-slate-800 leading-relaxed italic">
                        {pillar.quote}
                      </p>
                    </blockquote>
                  )}

                  {pillar.footer?.map((p, i) => (
                    <p key={`f-${i}`}>{p}</p>
                  ))}
                </div>

                {pillar.highlight && (
                  <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-purple-200 text-purple-700 text-xs font-semibold">
                    <ShieldCheck size={13} />
                    Future Direction
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Closing */}
        <div
          className="mt-12 relative rounded-3xl overflow-hidden border border-slate-200 shadow-2xl shadow-purple-900/10"
          style={{ background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #2563eb 100%)" }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.12]"
            style={{ backgroundImage: "radial-gradient(#ffffff 0.8px, transparent 0.8px)", backgroundSize: "22px 22px" }}
          />
          <div className="relative px-6 sm:px-10 py-10 sm:py-12 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white text-xs font-semibold mb-4">
              <Sparkles size={12} />
              {CLOSING.title}
            </span>
            <p className="text-lg sm:text-xl md:text-2xl font-semibold text-white leading-relaxed max-w-2xl mx-auto">
              {CLOSING.line}
            </p>
            <p className="mt-6 text-sm sm:text-base font-bold tracking-wide text-white/90 uppercase">
              {CLOSING.tagline}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}