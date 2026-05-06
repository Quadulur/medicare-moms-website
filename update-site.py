#!/usr/bin/env python3
"""
Medicare Moms Website Update Script
Run from inside the medicare-moms-website directory.
Changes:
1. Updates resources.html - removes ACA section, adds callout to new ACA page
2. Adds Services hover dropdown to nav on all pages
"""
import glob, re, os

print("Starting site updates...")

# ============================================================
# 1. UPDATE RESOURCES.HTML - Remove ACA section, add callout
# ============================================================
f = 'resources.html'
if os.path.exists(f):
    with open(f, 'r') as h:
        t = h.read()

    # Remove the ACA & Individual tab from page-nav
    t = t.replace(
        '                    <a href="#aca-individual">ACA & Individual</a>\n                    <a href="#ancillary">Ancillary Benefits</a>',
        '                    <a href="#ancillary">Ancillary Benefits</a>'
    )

    # Replace entire ACA section with callout
    aca_start = t.find('<!-- ===================================================\n         SECTION 4: ACA / INDIVIDUAL INSURANCE')
    if aca_start == -1:
        aca_start = t.find('SECTION 4: ACA')

    aca_end = t.find('<!-- ===================================================\n         SECTION 5: ANCILLARY BENEFITS')
    if aca_end == -1:
        aca_end = t.find('SECTION 5: ANCILLARY')

    if aca_start != -1 and aca_end != -1:
        # Back up to include the comment opening
        search_back = t.rfind('<!--', 0, aca_start + 10)
        if search_back != -1 and search_back > aca_start - 20:
            aca_start = search_back

        callout_html = """    <!-- ===================================================
         ACA CALLOUT (links to separate ACA page)
         =================================================== -->
    <section class="section-white section-padding" id="aca-callout">
        <div class="container">
            <div class="narrow-container" style="text-align: center;">
                <h2>Not 65 Yet? Have a Spouse Who Won't Be on Medicare?</h2>
                <p style="font-size: 18px; color: #4A5568; max-width: 650px; margin: 0 auto 25px;">You still have options. The ACA marketplace and individual health plans offer affordable coverage for you and your family &mdash; and you might qualify for more help than you think.</p>
                <a href="aca-resources.html" class="btn btn-primary" style="font-size: 16px; padding: 14px 35px;">Explore ACA & Individual Plans &rarr;</a>
            </div>
        </div>
    </section>


"""
        # Find the start of the next comment block for section 5
        next_comment = t.rfind('<!--', 0, aca_end + 10)
        if next_comment != -1 and next_comment > aca_end - 20:
            aca_end = next_comment

        t = t[:aca_start] + callout_html + t[aca_end:]

        with open(f, 'w') as h:
            h.write(t)
        print(f"  Updated: {f} (ACA section replaced with callout)")
    else:
        print(f"  WARNING: Could not find ACA section markers in {f}")
else:
    print(f"  WARNING: {f} not found")


# ============================================================
# 2. ADD SERVICES DROPDOWN TO NAV ON ALL PAGES
# ============================================================

dropdown_css = """
        /* Services Dropdown */
        .services-parent {
            position: relative;
        }
        .services-dropdown {
            display: none;
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(44, 44, 44, 0.15);
            padding: 16px 0;
            min-width: 240px;
            z-index: 1000;
            margin-top: 10px;
        }
        .services-dropdown::before {
            content: '';
            position: absolute;
            top: -10px;
            left: 0;
            right: 0;
            height: 10px;
        }
        .services-parent:hover .services-dropdown {
            display: block;
        }
        .services-dropdown a {
            display: block;
            padding: 10px 24px;
            color: #2C2C2C;
            font-size: 13px;
            font-weight: 500;
            text-decoration: none;
            white-space: nowrap;
            transition: background 0.2s, color 0.2s;
        }
        .services-dropdown a:hover {
            background: #F7F3ED;
            color: #5B8C6B;
        }
        @media (max-width: 768px) {
            .services-dropdown {
                position: static;
                transform: none;
                box-shadow: none;
                margin-top: 0;
                padding: 0 0 0 20px;
                border-radius: 0;
            }
            .services-parent:hover .services-dropdown {
                display: block;
            }
        }
"""

dropdown_nav = """<li class="services-parent"><a href="services.html">Services</a>
                        <div class="services-dropdown">
                            <a href="services.html#medicare-advantage">Medicare Advantage (Part C)</a>
                            <a href="services.html#medigap">Medicare Supplements</a>
                            <a href="services.html#aca">ACA / Marketplace Plans</a>
                            <a href="services.html#dental-vision">Dental &amp; Vision</a>
                            <a href="services.html#life-insurance">Life Insurance</a>
                            <a href="services.html#accident">Accident &amp; Critical Illness</a>
                        </div>
                    </li>"""

old_nav_link = '<li><a href="services.html">Services</a></li>'

for f in glob.glob('*.html'):
    with open(f, 'r') as h:
        t = h.read()

    changed = False

    # Only add dropdown CSS if not already present
    if '.services-dropdown' not in t:
        # Find the right place to insert CSS - before the closing </style> tag
        # We want the FIRST </style> (main stylesheet, not inline)
        style_end = t.find('</style>')
        if style_end != -1:
            t = t[:style_end] + dropdown_css + '\n    ' + t[style_end:]
            changed = True

    # Replace ONLY the first occurrence of the nav link (in the nav bar, not footer)
    if old_nav_link in t and 'services-parent' not in t:
        t = t.replace(old_nav_link, dropdown_nav, 1)
        changed = True

    if changed:
        with open(f, 'w') as h:
            h.write(t)
        print(f"  Updated: {f} (Services dropdown added)")

# ============================================================
# 3. UPDATE JOIN-OUR-TEAM.HTML
# ============================================================
f = 'join-our-team.html'
if os.path.exists(f):
    with open(f, 'r') as h:
        t = h.read()

    # Replace em dashes with proper punctuation
    replacements = [
        ('No experience needed — we\'ll teach you everything',
         'No experience needed. We\'ll teach you everything'),
        ('We\'re not just another agency — we\'re a movement',
         'We\'re not just another agency, we\'re a movement'),
        ('Sells year-round — no enrollment window needed.',
         'Sells year-round, no enrollment window needed.'),
        ('my purpose — all while being',
         'my purpose, all while being'),
        ('important decisions — it\'s just',
         'important decisions, it\'s just'),
        ('put in — there\'s no minimum',
         'put in, there\'s no minimum'),
        ('your hours — work during',
         'your hours. Work during'),
    ]
    for old, new in replacements:
        t = t.replace(old, new)

    # Update Additional Income card
    t = t.replace(
        'Add a flexible income stream that works around your life. Your commissions are yours to keep, and you set your own pace.',
        'Most insurance products pay residual commissions, meaning your income is stable and consistent. As your book of business grows, so does your recurring revenue, even on days you\'re not actively selling.'
    )

    # Replace Be Your Own Boss with Supported Growth
    t = t.replace(
        '<h3>Be Your Own Boss</h3>\n                <p>Build YOUR business, not someone else\'s. Make your own decisions. Set your own hours. Keep what you earn. True entrepreneurship, backed by our support system.</p>',
        '<h3>Supported Growth</h3>\n                <p>We also have opportunities to bring agents on where we support you with paid leads, help source stable business, and provide the structure you need to succeed. You get the best of both worlds: real support and real opportunity.</p>'
    )

    with open(f, 'w') as h:
        h.write(t)
    print(f"  Updated: {f} (em dashes, Additional Income, Supported Growth)")
else:
    print(f"  WARNING: {f} not found")

print("\nAll updates complete! Ready to commit and push.")
