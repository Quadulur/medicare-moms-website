/*
 * HealthPlan Moms ad landing pages: settings.
 * Live at healthplanmoms.com/go/<variant>/  (plans, self-employed, family, talk)
 * acamoms.com forwards to /go/plans/?d=acamoms so leads still show which domain the ad used.
 */
window.HPM_LP = {
  brand: 'hpm',
  product: 'aca',
  planYear: 2027,

  // Lead Floor intake (POST /api/lead-intake/<hpm-token>). Leave empty until the
  // endpoint exists on the Floor worker; leads then go to Rocket CRM below.
  intakeUrl: '',

  // Rocket CRM inbound webhook ("HPM | Website Lead Intake"). Ad leads arrive with kind "ad".
  crmWebhook: 'https://services.leadconnectorhq.com/hooks/LSuIvEciA8JlCaL35rzM/webhook-trigger/642a0837-5bb0-4824-8571-afde058cb752',

  // hpm-quoter-proxy Worker URL (healthsherpa-quoter-worker folder) for the "plans available" count.
  quoterUrl: '',

  phone: '(435) 246-1548',
  phoneTel: '+14352461548',
  defaultVariant: 'plans',

  // Entry domains the ?d= tag can name. Add medicaremoms / medigapmoms here when Medicare pages launch.
  entryDomains: { acamoms: 'acamoms.com', healthplanmoms: 'healthplanmoms.com' },

  // Meta pixel ID. One pixel for the HealthPlan Moms ads; split results by utm_content and site.
  pixel: ''
};
