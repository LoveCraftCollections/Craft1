import { z } from "zod";

export const templates = ["rajam", "aarambham", "mana-pelli"] as const;
export type TemplateId = (typeof templates)[number];
export type Language = "en" | "te";
export type LocalizedText = { en: string; te: string };

const localizedTextSchema = z.object({ en: z.string(), te: z.string() });
const imageUrlSchema = z.union([
  z.string().regex(/^\/(?!\/)/),
  z.string().url().refine((value) => value.startsWith("https://")),
]);

export const weddingConfigSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  isDemo: z.boolean(),
  published: z.boolean(),
  language: z.enum(["en", "te"]),
  content: z.object({
    opening: localizedTextSchema,
    welcome: localizedTextSchema,
    closing: localizedTextSchema,
    blessing: localizedTextSchema,
  }),
  image: imageUrlSchema,
  couple: z.object({
    names: localizedTextSchema,
    intro: localizedTextSchema,
    illustrationAlt: localizedTextSchema,
  }),
  families: z.object({
    bride: z.object({ name: localizedTextSchema, family: localizedTextSchema, parents: localizedTextSchema.optional() }),
    groom: z.object({ name: localizedTextSchema, family: localizedTextSchema, parents: localizedTextSchema.optional() }),
    invitation: localizedTextSchema,
  }),
  ceremony: z.object({
    date: z.string().date(),
    time: z.string().regex(/^\d{2}:\d{2}$/),
    timeZone: z.string().min(1),
    muhurtham: localizedTextSchema,
  }),
  events: z.array(z.object({
    id: z.string(),
    name: localizedTextSchema,
    date: z.string().date(),
    time: z.string().regex(/^\d{2}:\d{2}$/),
    venue: localizedTextSchema,
    note: localizedTextSchema.optional(),
  })),
  venue: z.object({
    name: localizedTextSchema,
    address: localizedTextSchema,
    mapsUrl: z.string().url(),
    parking: localizedTextSchema,
    contactName: localizedTextSchema,
    contactPhone: z.string().regex(/^\+?[0-9]{7,15}$/),
  }),
  opening: z.object({ enabled: z.boolean() }),
  theme: z.object({
    template: z.enum(templates),
    palette: z.object({ accent: z.string().regex(/^#[0-9a-fA-F]{6}$/), background: z.string().regex(/^#[0-9a-fA-F]{6}$/), highlight: z.string().regex(/^#[0-9a-fA-F]{6}$/) }),
    typography: z.object({ heading: z.string().min(1), body: z.string().min(1) }),
  }),
  gallery: z.array(z.object({ src: imageUrlSchema, alt: localizedTextSchema })),
  music: z.object({ enabled: z.boolean(), audioUrl: z.string().url().optional() }),
  visibility: z.object({
    countdown: z.boolean(),
    families: z.boolean(),
    events: z.boolean(),
    venue: z.boolean(),
    rsvp: z.boolean(),
    gallery: z.boolean(),
  }),
  rsvp: z.object({ enabled: z.boolean(), deadline: z.string().date() }),
  seo: z.object({ title: z.string(), description: z.string(), socialImage: imageUrlSchema }),
});

export type WeddingConfig = z.infer<typeof weddingConfigSchema>;

export const demoWedding: WeddingConfig = weddingConfigSchema.parse({
  id: "demo-sravani-karthik-2026",
  slug: "sravani-karthik",
  isDemo: true,
  published: true,
  language: "en",
  content: {
    opening: { en: "With blessings,", te: "శ్రీ గణేశాయ నమః" },
    welcome: { en: "A joyous beginning", te: "సాదర ఆహ్వానం" },
    closing: { en: "Your presence means the world to us.", te: "మీ రాకతో మా వేడుక మరింత ప్రత్యేకం." },
    blessing: { en: "Your blessings are our greatest gift.", te: "మీ ఆశీస్సులు మా బలం." },
  },
  image: "/wedding-couple.jpg",
  couple: {
    names: { en: "Sravani & Karthik", te: "శ్రావణి & కార్తిక్" },
    intro: {
      en: "With joy in our hearts and the blessings of our families, we invite you to celebrate the beginning of our forever.",
      te: "మా కుటుంబాల ఆశీస్సులతో, మా జీవితంలో కొత్త అధ్యాయానికి మీకు సాదర ఆహ్వానం.",
    },
    illustrationAlt: {
      en: "An illustrated bride and groom beneath a flower-draped wedding arch",
      te: "పూలతో అలంకరించిన పెళ్లి పందిరి కింద వధూవరుల చిత్రం",
    },
  },
  families: {
    bride: {
      name: { en: "Sravani", te: "శ్రావణి" },
      family: { en: "Daughter of Lakshmi & Ramesh Varma", te: "లక్ష్మి & రమేష్ వర్మ గార్ల కుమార్తె" },
      parents: { en: "Lakshmi & Ramesh Varma", te: "లక్ష్మి & రమేష్ వర్మ" },
    },
    groom: {
      name: { en: "Karthik", te: "కార్తిక్" },
      family: { en: "Son of Anuradha & Srinivas Rao", te: "అనురాధ & శ్రీనివాస్ రావు గార్ల కుమారుడు" },
      parents: { en: "Anuradha & Srinivas Rao", te: "అనురాధ & శ్రీనివాస్ రావు" },
    },
    invitation: {
      en: "Together with our families, we joyfully invite you to share in the celebration of our marriage.",
      te: "మా కుటుంబాల సమక్షంలో జరిగే మా వివాహ వేడుకకు మీకు సాదర ఆహ్వానం.",
    },
  },
  ceremony: {
    date: "2026-11-22",
    time: "10:42",
    timeZone: "Asia/Kolkata",
    muhurtham: { en: "The auspicious hour", te: "శుభ ముహూర్తం" },
  },
  events: [
    {
      id: "pellikuthuru",
      name: { en: "Pellikuthuru", te: "పెళ్లికూతురు" },
      date: "2026-11-20",
      time: "18:00",
      venue: { en: "At the bride's home", te: "వధువు నివాసంలో" },
      note: { en: "A close family gathering", te: "కుటుంబ సభ్యుల సమక్షంలో" },
    },
    {
      id: "sangeet",
      name: { en: "Sangeet & Mehendi", te: "సంగీత్ & మెహందీ" },
      date: "2026-11-21",
      time: "18:30",
      venue: { en: "Courtyard, Nandana Garden Estate", te: "ప్రాంగణం, నందన గార్డెన్ ఎస్టేట్" },
      note: { en: "An evening of music, mehendi and laughter", te: "సంగీతం, మెహందీతో నిండిన సాయంత్రం" },
    },
    {
      id: "wedding",
      name: { en: "Wedding ceremony", te: "వివాహ మహోత్సవం" },
      date: "2026-11-22",
      time: "10:42",
      venue: { en: "Mango Grove Hall, Hyderabad", te: "మామిడి తోట కల్యాణ మండపం, హైదరాబాద్" },
      note: { en: "Muhurtham followed by a celebratory lunch", te: "శుభ ముహూర్తం అనంతరం విందు భోజనం" },
    },
    {
      id: "reception",
      name: { en: "Reception", te: "విందు" },
      date: "2026-11-22",
      time: "18:30",
      venue: { en: "Mango Grove Hall, Hyderabad", te: "మామిడి తోట కల్యాణ మండపం, హైదరాబాద్" },
      note: { en: "Join us for dinner and warm wishes", te: "రాత్రి భోజనానికి, శుభాకాంక్షలకు విచ్చేయండి" },
    },
  ],
  venue: {
    name: { en: "Mango Grove Hall", te: "మామిడి తోట కల్యాణ మండపం" },
    address: {
      en: "12 Banyan Lane, Jubilee Hills, Hyderabad, Telangana 500033",
      te: "12 మర్రిచెట్టు వీధి, జూబ్లీ హిల్స్, హైదరాబాద్, తెలంగాణ 500033",
    },
    mapsUrl: "https://maps.google.com/?q=Jubilee+Hills+Hyderabad",
    parking: { en: "Complimentary parking is available at the venue.", te: "వేదిక వద్ద ఉచిత పార్కింగ్ సౌకర్యం ఉంది." },
    contactName: { en: "Anand Rao", te: "ఆనంద్ రావు" },
    contactPhone: "+919876543210",
  },
  opening: { enabled: true },
  theme: {
    template: "rajam",
    palette: { accent: "#6D2435", background: "#F4EDE1", highlight: "#B69A61" },
    typography: { heading: "Cormorant Garamond", body: "Noto Sans Telugu" },
  },
  gallery: [],
  music: { enabled: false },
  visibility: { countdown: true, families: true, events: true, venue: true, rsvp: true, gallery: false },
  rsvp: { enabled: true, deadline: "2026-11-10" },
  seo: {
    title: "Sravani & Karthik | Mana Pelli",
    description: "Join Sravani and Karthik as they begin their forever in Hyderabad, November 22, 2026.",
    socialImage: "/wedding-couple.jpg",
  },
});

export function localized(text: LocalizedText, language: Language) {
  return text[language];
}

export function getCeremonyTimestamp(wedding: WeddingConfig) {
  const [year, month, day] = wedding.ceremony.date.split("-").map(Number);
  const [hour, minute] = wedding.ceremony.time.split(":").map(Number);
  const targetWallTime = Date.UTC(year, month - 1, day, hour, minute);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: wedding.ceremony.timeZone,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  });
  let utcTimestamp = targetWallTime;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const parts = Object.fromEntries(formatter.formatToParts(new Date(utcTimestamp)).map(({ type, value }) => [type, Number(value)]));
    const localAsUtc = Date.UTC(parts.year!, parts.month! - 1, parts.day!, parts.hour!, parts.minute!, parts.second!);
    utcTimestamp = targetWallTime - (localAsUtc - utcTimestamp);
  }

  return utcTimestamp;
}

export function getCountdownParts(wedding: WeddingConfig, now: number) {
  const remaining = getCeremonyTimestamp(wedding) - now;
  if (remaining <= 0) return null;
  const totalSeconds = Math.floor(remaining / 1000);

  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function switchWeddingTemplate(wedding: WeddingConfig, template: TemplateId): WeddingConfig {
  return { ...wedding, theme: { ...wedding.theme, template } };
}

export function findPublishedWedding(weddings: readonly WeddingConfig[], slug: string): WeddingConfig | null {
  return weddings.find((wedding) => wedding.slug === slug && wedding.published) ?? null;
}