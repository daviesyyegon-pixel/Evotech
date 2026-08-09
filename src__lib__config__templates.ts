export interface TemplateDef {
  id: string;
  label: string;
  description: string;
  keywords: string[]; // used for lightweight local pre-selection before AI confirms
}

export const TEMPLATES: TemplateDef[] = [
  { id: "business", label: "General Business", description: "A flexible template for most small businesses.", keywords: ["shop", "store", "company", "business"] },
  { id: "restaurant", label: "Restaurant & Food", description: "Menus, food photography sections, ordering CTAs.", keywords: ["restaurant", "cafe", "food", "kitchen", "eatery"] },
  { id: "barber-salon", label: "Barber / Salon", description: "Services, pricing, booking-style CTAs.", keywords: ["barber", "salon", "beauty", "haircut", "grooming"] },
  { id: "portfolio", label: "Portfolio", description: "For freelancers, creatives, and consultants.", keywords: ["portfolio", "freelance", "designer", "photographer"] },
  { id: "ecommerce", label: "E-commerce", description: "Product listings and catalog-style sections.", keywords: ["ecommerce", "online shop", "products", "sell"] },
  { id: "professional-services", label: "Professional Services", description: "Law, accounting, consulting firms.", keywords: ["law", "accounting", "consulting", "firm"] },
  { id: "school", label: "School / Education", description: "Programs, admissions, staff, announcements.", keywords: ["school", "academy", "education", "college"] },
  { id: "church-organization", label: "Church / Organization", description: "Services, ministries, events, giving.", keywords: ["church", "ministry", "ngo", "ngo", "organization"] },
  { id: "real-estate", label: "Real Estate", description: "Listings, agents, inquiry CTAs.", keywords: ["real estate", "property", "land", "houses"] },
  { id: "technology", label: "Technology", description: "SaaS, apps, and tech consulting.", keywords: ["tech", "software", "app", "saas", "it"] },
];
