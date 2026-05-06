#!/usr/bin/env python3
"""
Medicare Moms Website Update Script #2
Run from inside the medicare-moms-website directory.
Changes:
1. Replaces (800) 555-1234 with Ally Valdez (435) 246-1548 on all pages
2. Fixes contact link colors (#A8C5A0 -> white) on dark backgrounds
3. Updates Services dropdown to include Enrolling in Medicare and Needs Analysis
4. Fixes resources.html hero text and Medigap plan list
"""
import glob, re, os

print("Starting site updates...")

# ============================================================
# 1. REPLACE PHONE NUMBER AND FIX CONTACT COLORS ON ALL PAGES
# ============================================================
for f in glob.glob('*.html'):
    with open(f, 'r') as h:
        t = h.read()

    changed = False

    # Replace placeholder phone number with Ally Valdez
    if '(800) 555-1234' in t or '8005551234' in t:
        t = t.replace('(800) 555-1234', '(435) 246-1548')
        t = t.replace('+18005551234', '+14352461548')
        t = t.replace('8005551234', '4352461548')
        changed = True

    # Fix contact link colors - inline styles on dark backgrounds
    if 'color: #A8C5A0; text-decoration: none;">' in t:
        # Only fix the contact method links (phone/email), not footer hover effects
        t = t.replace(
            'style="color: #A8C5A0; text-decoration: none;">(435) 246-1548',
            'style="color: #FFFFFF; text-decoration: none;">(435) 246-1548'
        )
        t = t.replace(
            'style="color: #A8C5A0; text-decoration: none;">(800) 555-1234',
            'style="color: #FFFFFF; text-decoration: none;">(435) 246-1548'
        )
        t = t.replace(
            'style="color: #A8C5A0; text-decoration: none;">info@medicaremoms.com',
            'style="color: #FFFFFF; text-decoration: none;">info@medicaremoms.com'
        )
        changed = True

    # Fix the schema.org telephone
    if '"telephone": "(800) 555-1234"' in t:
        t = t.replace('"telephone": "(800) 555-1234"', '"telephone": "(435) 246-1548"')
        changed = True

    if changed:
        with open(f, 'w') as h:
            h.write(t)
        print(f"  Updated: {f} (phone number + contact colors)")

# ============================================================
# 2. UPDATE SERVICES DROPDOWN ON ALL PAGES
# ============================================================
# The new dropdown with Enrolling in Medicare and Needs Analysis added
old_dropdown_items = """                            <a href="services.html#medicare-advantage">Medicare Advantage (Part C)</a>
                            <a href="services.html#medigap">Medicare Supplements</a>
                            <a href="services.html#aca">ACA / Marketplace Plans</a>
                            <a href="services.html#dental-vision">Dental &amp; Vision</a>
                            <a href="services.html#life-insurance">Life Insurance</a>
                            <a href="services.html#accident">Accident &amp; Critical Illness</a>"""

new_dropdown_items = """                            <a href="services.html#medicare-advantage">Medicare Advantage (Part C)</a>
                            <a href="services.html#medigap">Medicare Supplements</a>
                            <a href="services.html#aca">ACA / Marketplace Plans</a>
                            <a href="services.html#dental-vision">Dental &amp; Vision</a>
                            <a href="services.html#life-insurance">Life Insurance</a>
                            <a href="services.html#accident">Accident &amp; Critical Illness</a>
                            <a href="enroll-medicare.html" style="border-top: 1px solid #eee; margin-top: 6px; padding-top: 14px;">Enrolling in Medicare</a>
                            <a href="needs-analysis.html">Free Needs Analysis</a>"""

for f in glob.glob('*.html'):
    with open(f, 'r') as h:
        t = h.read()

    if old_dropdown_items in t:
        t = t.replace(old_dropdown_items, new_dropdown_items)
        with open(f, 'w') as h:
            h.write(t)
        print(f"  Updated: {f} (dropdown links)")

# ============================================================
# 3. FIX RESOURCES.HTML - hero text + Medigap plans
# ============================================================
f = 'resources.html'
if os.path.exists(f):
    with open(f, 'r') as h:
        t = h.read()

    changed = False

    # Update hero subtitle
    if 'Medicare, ACA plans, and more' in t:
        t = t.replace('Medicare, ACA plans, and more', 'Medicare, individual health plans, and more')
        changed = True

    # Fix Medigap other plans list
    if 'Other Plans (A, B, D, K, L, M)' in t:
        t = t.replace('Other Plans (A, B, D, K, L, M)', 'Other Plans (A, B, C, D, F, K, L, M)')
        t = t.replace('Plan F is available only', 'Plans C and F are available only')
        changed = True

    if changed:
        with open(f, 'w') as h:
            h.write(t)
        print(f"  Updated: {f} (hero text + Medigap plans)")

print("\nAll updates complete! Ready to commit and push.")
