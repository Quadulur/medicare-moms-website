import { useState } from "react";

const schemes = {
  sage: {
    name: "Sage & Cream",
    desc: "Earthy, nurturing, grounded. Nobody in insurance uses green well — this stands out immediately.",
    fontNote: "DM Serif Display (headings) + Nunito (body). Feels personal, not corporate.",
    colors: {
      dark: "#3D6B4A", primary: "#5B8C6B", light: "#A8C5A0",
      bg: "#F7F3ED", accent: "#D4956B", text: "#2C2C2C",
    },
    heroBg: "linear-gradient(160deg, #F7F3ED 0%, #EDE8DF 40%, #E8F0E5 100%)",
    ctaBg: "linear-gradient(135deg, #3D6B4A 0%, #2C5038 100%)",
    cardBg: "#F7F3ED", cardBorder: "#E8E0D4",
    testimonialBg: "#F7F3ED", testimonialBorder: "#E8E0D4",
    headingFont: "'Georgia', serif",
    bodyFont: "system-ui, -apple-system, sans-serif",
  },
  ocean: {
    name: "Ocean Calm",
    desc: "Serene, trustworthy, calming. Like a deep breath before a decision. Teal-blue conveys expertise without feeling cold.",
    fontNote: "Outfit (headings, weight 800) + Inter (body). Modern, professional but approachable.",
    colors: {
      dark: "#1E3A4F", primary: "#3B7EA1", light: "#7CBAC8",
      bg: "#F4F8FA", accent: "#E8A87C", text: "#1C1C2E",
    },
    heroBg: "linear-gradient(160deg, #F4F8FA 0%, #E8F1F5 40%, #F4F8FA 100%)",
    ctaBg: "linear-gradient(135deg, #1E3A4F 0%, #2A5F7A 100%)",
    cardBg: "#F4F8FA", cardBorder: "#DDE8EE",
    testimonialBg: "#F4F8FA", testimonialBorder: "#DDE8EE",
    headingFont: "system-ui, -apple-system, sans-serif",
    bodyFont: "system-ui, -apple-system, sans-serif",
  },
  sunset: {
    name: "Warm Sunset",
    desc: "Rich, warm, inviting. Like golden hour. A more sophisticated evolution of the current coral — deeper and more grounded.",
    fontNote: "Playfair Display (headings) + Inter (body). Elegant warmth — premium without being stuffy.",
    colors: {
      dark: "#3A2520", primary: "#C4704E", light: "#E8A882",
      bg: "#FDF8F4", accent: "#5E8B7E", text: "#2D2D2D",
    },
    heroBg: "linear-gradient(160deg, #FDF8F4 0%, #F8EDE5 40%, #FDF8F4 100%)",
    ctaBg: "linear-gradient(135deg, #3A2520 0%, #5A3A30 100%)",
    cardBg: "#FDF8F4", cardBorder: "#F0E4D8",
    testimonialBg: "#FDF8F4", testimonialBorder: "#F0E4D8",
    headingFont: "'Georgia', serif",
    bodyFont: "system-ui, -apple-system, sans-serif",
  },
  plum: {
    name: "Plum & Gold",
    desc: "Unexpected for insurance — that's the point. Plum says 'we're different,' gold says 'you're worth it.' Empowering and unique.",
    fontNote: "Outfit (headings, weight 800) + Nunito (body). Confident yet gentle.",
    colors: {
      dark: "#2E1F42", primary: "#7B5EA7", light: "#B8A0D2",
      bg: "#FAF7FD", accent: "#D4A843", text: "#1E1E2E",
    },
    heroBg: "linear-gradient(160deg, #FAF7FD 0%, #F0EBF7 40%, #FAF7FD 100%)",
    ctaBg: "linear-gradient(135deg, #2E1F42 0%, #3D2B57 100%)",
    cardBg: "#FAF7FD", cardBorder: "#E8DFF2",
    testimonialBg: "#FAF7FD", testimonialBorder: "#E8DFF2",
    headingFont: "system-ui, -apple-system, sans-serif",
    bodyFont: "system-ui, -apple-system, sans-serif",
  },
};

const ShieldIcon = ({ color = "white", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);

const HeartPulseIcon = ({ color = "white", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>
  </svg>
);

const UsersIcon = ({ color = "white", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const Swatch = ({ color, label }) => (
  <div style={{
    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
  }}>
    <div style={{
      width: 56, height: 56, borderRadius: 10, background: color,
      boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
      border: color === "#F7F3ED" || color === "#F4F8FA" || color === "#FDF8F4" || color === "#FAF7FD"
        ? "1px solid #d1d5db" : "none",
    }} />
    <span style={{ fontSize: 10, fontWeight: 600, fontFamily: "monospace", color: "#6b7280" }}>{label}</span>
  </div>
);

export default function BrandPreview() {
  const [active, setActive] = useState("sage");
  const s = schemes[active];
  const c = s.colors;

  return (
    <div style={{ fontFamily: s.bodyFont, background: "#F3F4F6", minHeight: "100vh" }}>
      {/* Scheme Selector */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100, background: "white",
        borderBottom: "1px solid #e5e7eb", padding: "14px 20px",
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e", marginRight: 4 }}>Pick a Direction:</span>
        {Object.entries(schemes).map(([key, val]) => (
          <button key={key} onClick={() => setActive(key)} style={{
            padding: "8px 16px", borderRadius: 30, cursor: "pointer",
            border: active === key ? `2px solid ${val.colors.primary}` : "2px solid #d1d5db",
            background: active === key ? val.colors.bg : "white",
            color: active === key ? val.colors.dark : "#374151",
            fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 8,
            transition: "all 0.2s ease",
          }}>
            <span style={{
              width: 12, height: 12, borderRadius: "50%", background: val.colors.primary,
              display: "inline-block", border: "1px solid rgba(0,0,0,0.1)",
            }} />
            {val.name}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "30px 20px" }}>
        {/* Scheme Info */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h1 style={{ fontFamily: s.headingFont, fontSize: 32, fontWeight: 800, color: c.dark, marginBottom: 8 }}>
            {s.name}
          </h1>
          <p style={{ fontSize: 16, color: "#6b7280", maxWidth: 600, margin: "0 auto 16px" }}>{s.desc}</p>
          <p style={{ fontSize: 13, color: "#9ca3af", fontStyle: "italic" }}>{s.fontNote}</p>
        </div>

        {/* Palette */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 32, flexWrap: "wrap" }}>
          <Swatch color={c.dark} label={c.dark} />
          <Swatch color={c.primary} label={c.primary} />
          <Swatch color={c.light} label={c.light} />
          <Swatch color={c.bg} label={c.bg} />
          <Swatch color={c.accent} label={c.accent} />
          <Swatch color={c.text} label={c.text} />
        </div>

        {/* Site Preview */}
        <div style={{ borderRadius: 14, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }}>

          {/* Nav */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "16px 28px", background: "white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}>
            <span style={{ fontFamily: s.headingFont, fontSize: 20, fontWeight: 700, color: c.primary }}>
              Medicare Moms
            </span>
            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
              {["Services", "Resources", "Our Team", "Contact"].map(link => (
                <span key={link} style={{ fontSize: 14, fontWeight: 500, color: c.text }}>{link}</span>
              ))}
              <span style={{
                padding: "8px 18px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                background: c.primary, color: "white",
              }}>Join Our Team</span>
            </div>
          </div>

          {/* Hero */}
          <div style={{ background: s.heroBg, padding: "64px 40px", textAlign: "center" }}>
            <h1 style={{
              fontFamily: s.headingFont, fontSize: 40, fontWeight: 800,
              color: c.text, marginBottom: 16, lineHeight: 1.2,
            }}>
              Health Coverage Made Simple.<br />By Moms Who Care.
            </h1>
            <p style={{
              fontSize: 17, color: "#5a5a5a", maxWidth: 540, margin: "0 auto 28px", lineHeight: 1.65,
            }}>
              Finding the right plan doesn't have to be overwhelming. We'll walk you through every option and help you choose coverage that fits your life.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <span style={{
                padding: "13px 30px", borderRadius: 8, fontWeight: 600, fontSize: 15,
                background: c.primary, color: "white", boxShadow: `0 4px 14px ${c.primary}44`,
              }}>Find Your Plan</span>
              <span style={{
                padding: "13px 30px", borderRadius: 8, fontWeight: 600, fontSize: 15,
                background: "transparent", color: c.primary, border: `2px solid ${c.primary}`,
              }}>Call Us Today</span>
            </div>
          </div>

          {/* Cards Section */}
          <div style={{ background: "white", padding: "56px 36px" }}>
            <h2 style={{
              fontFamily: s.headingFont, fontSize: 30, fontWeight: 800,
              color: c.text, textAlign: "center", marginBottom: 8,
            }}>Coverage for Every Stage</h2>
            <p style={{ textAlign: "center", color: "#6b7280", fontSize: 15, marginBottom: 36 }}>
              Plans that make sense for your family's needs.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
              {[
                { icon: ShieldIcon, title: "Medicare Advantage", desc: "All-in-one coverage with dental, vision, and more at $0 premium.", iconBg: c.primary },
                { icon: HeartPulseIcon, title: "Medigap Supplements", desc: "See any doctor, anywhere. Predictable costs, fewer surprises.", iconBg: c.accent },
                { icon: UsersIcon, title: "ACA Marketplace", desc: "Affordable family coverage with subsidies and financial help.", iconBg: c.primary },
              ].map((card, i) => (
                <div key={i} style={{
                  background: s.cardBg, border: `1px solid ${s.cardBorder}`,
                  borderRadius: 12, padding: 26,
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: card.iconBg, display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 14,
                  }}>
                    <card.icon />
                  </div>
                  <h3 style={{
                    fontFamily: s.headingFont, fontSize: 17, fontWeight: 700,
                    color: c.text, marginBottom: 8,
                  }}>{card.title}</h3>
                  <p style={{ fontSize: 14, color: "#5a5a5a", lineHeight: 1.6, margin: 0 }}>{card.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div style={{ background: s.testimonialBg, padding: "48px 36px" }}>
            <div style={{
              maxWidth: 580, margin: "0 auto", background: "white",
              border: `1px solid ${s.testimonialBorder}`, borderRadius: 12,
              padding: "28px 30px", position: "relative",
            }}>
              <span style={{
                position: "absolute", top: -6, left: 22, fontSize: 56,
                color: c.light, fontFamily: "Georgia, serif", lineHeight: 1,
              }}>"</span>
              <p style={{
                fontSize: 15, fontStyle: "italic", color: "#5a5a5a",
                lineHeight: 1.7, marginBottom: 14, marginTop: 10,
              }}>
                I was so confused about Medicare options, but Sarah walked me through everything. She's like a friend, not a salesperson. I found a plan that saves me hundreds a month!
              </p>
              <p style={{ fontWeight: 600, fontSize: 14, color: c.primary, margin: 0 }}>
                — Margaret L., Portland, OR
              </p>
            </div>
          </div>

          {/* CTA */}
          <div style={{
            background: s.ctaBg, padding: "56px 36px", textAlign: "center",
            borderRadius: "0 0 14px 14px",
          }}>
            <h2 style={{
              fontFamily: s.headingFont, fontSize: 28, fontWeight: 800,
              color: "white", marginBottom: 12,
            }}>Ready to Find the Right Plan?</h2>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 16, marginBottom: 28, maxWidth: 500, margin: "0 auto 28px" }}>
              Let's talk. No pressure, no jargon — just real answers.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <span style={{
                padding: "13px 30px", borderRadius: 8, fontWeight: 600, fontSize: 15,
                background: c.accent, color: "white",
              }}>Get a Free Consultation</span>
              <span style={{
                padding: "13px 30px", borderRadius: 8, fontWeight: 600, fontSize: 15,
                background: "transparent", color: "white", border: "2px solid rgba(255,255,255,0.5)",
              }}>Call (555) 012-3456</span>
            </div>
          </div>
        </div>

        {/* Comparison note */}
        <p style={{
          textAlign: "center", fontSize: 13, color: "#9ca3af", marginTop: 24,
          fontStyle: "italic",
        }}>
          Click the tabs above to compare all four directions. Notice how the icons, cards, and overall feel change with each palette.
        </p>
      </div>
    </div>
  );
}