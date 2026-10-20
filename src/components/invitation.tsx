"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, Clock3, Flower2, Heart, MapPin, Phone, Sparkles, Users, X,
} from "lucide-react";
import { rsvpSchema } from "@/lib/validation";
import {
  demoWedding, getCeremonyTimestamp, getCountdownParts, localized, switchWeddingTemplate,
  type Language, type TemplateId, type WeddingConfig,
} from "@/lib/wedding";

const copy = {
  en: {
    demo: "A FICTIONAL DEMO INVITATION", opening: "MANA PELLI · మన పెళ్లి", open: "Open our invitation",
    openingHint: "A little something, made with love",
    design: "EXPLORE THE DESIGNS", designs: { rajam: "Rajam", aarambham: "Aarambham", "mana-pelli": "Mana Pelli" },
    withJoy: "Together with their families", events: "The celebrations", ceremony: "Our wedding",
    countdown: "Until we say I do", days: "DAYS", hours: "HOURS", minutes: "MINUTES", seconds: "SECONDS",
    location: "A place for our people", directions: "Get directions", calendar: "Add to calendar",
    parking: "A little help on the way", contact: "Questions? Call", rsvpHeading: "Will you celebrate with us?",
    guestName: "Your name", attending: "Will you be joining us?", yes: "Joyfully accepts", no: "Regretfully declines",
    guests: "Number of guests", message: "A note or blessing (optional)", notePlaceholder: "A little love goes a long way…",
    submit: "Send our reply", privacy: "Your reply stays private. This demo does not send or save RSVP details.",
    rsvpSuccess: "Thank you, your reply has been received in this demo.", rsvpDemo: "This demo does not save RSVP details; a host-connected service is not configured.",
    nameRequired: "Please enter your name.", guestRequired: "Please choose between 1 and 10 guests.",
    welcome: "Your presence means the world to us.", closing: "With love and gratitude", blessing: "Your blessings are our greatest gift.",
    call: "Call the family",
    familyBride: "THE BRIDE", familyGroom: "THE GROOM", eventTime: "At", fictional: "This invitation is a fictional, editable LoveCraft preview.",
    galleryTitle: "Moments, kept forever", previousPhoto: "Previous photograph", nextPhoto: "Next photograph", closeGallery: "Close gallery",
  },
  te: {
    demo: "కల్పిత డెమో ఆహ్వానం", opening: "మన పెళ్లి · MANA PELLI", open: "మా ఆహ్వానాన్ని చూడండి",
    openingHint: "మనసుతో తయారుచేసిన చిన్న కానుక",
    design: "డిజైన్లను చూడండి", designs: { rajam: "రాజసం", aarambham: "ఆరంభం", "mana-pelli": "మన పెళ్లి" },
    withJoy: "రెండు కుటుంబాల సమక్షంలో", events: "వేడుకల వివరాలు", ceremony: "మా వివాహం",
    countdown: "వివాహానికి మిగిలిన సమయం", days: "రోజులు", hours: "గంటలు", minutes: "నిమిషాలు", seconds: "సెకన్లు",
    location: "మన కోసం ఎదురుచూస్తున్న వేదిక", directions: "దారి తెలుసుకోండి", calendar: "క్యాలెండర్‌లో చేర్చండి",
    parking: "ప్రయాణ వివరాలు", contact: "సంప్రదించండి", rsvpHeading: "మాతో జరుపుకుంటారా?",
    guestName: "మీ పేరు", attending: "మీరు విచ్చేస్తారా?", yes: "తప్పక వస్తాము", no: "రాలేకపోతున్నాము",
    guests: "ఎంతమంది వస్తారు?", message: "మీ సందేశం లేదా ఆశీస్సులు (ఐచ్ఛికం)", notePlaceholder: "మీ ప్రేమతో నిండిన మాటలు…",
    submit: "మీ సమాధానం పంపండి", privacy: "మీ వివరాలు ప్రైవేట్‌గా ఉంటాయి. ఈ డెమో మీ సమాధానాన్ని పంపదు లేదా భద్రపరచదు.",
    rsvpSuccess: "ధన్యవాదాలు. ఈ డెమోలో మీ సమాధానం అందింది.", rsvpDemo: "ఈ డెమో సమాధానాలను భద్రపరచదు; హోస్ట్‌తో అనుసంధానం ఇంకా లేదు.",
    nameRequired: "దయచేసి మీ పేరు నమోదు చేయండి.", guestRequired: "దయచేసి 1 నుంచి 10 మంది వరకు ఎంచుకోండి.",
    welcome: "మీ రాకతో మా వేడుక మరింత ప్రత్యేకం.", closing: "ప్రేమతో, కృతజ్ఞతతో", blessing: "మీ ఆశీస్సులు మా బలం.",
    call: "కుటుంబ సభ్యులకు కాల్ చేయండి",
    familyBride: "వధువు", familyGroom: "వరుడు", eventTime: "సమయం", fictional: "ఈ ఆహ్వానం LoveCraft రూపొందించిన కల్పిత డెమో. వివరాలన్నీ మార్చుకోవచ్చు.",
    galleryTitle: "ఎప్పటికీ గుర్తుండిపోయే క్షణాలు", previousPhoto: "మునుపటి ఫోటో", nextPhoto: "తదుపరి ఫోటో", closeGallery: "గ్యాలరీని మూసివేయండి",
  },
} satisfies Record<Language, Record<string, unknown>>;

function formatDate(date: string, language: Language) {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat(language === "te" ? "te-IN" : "en-US", {
    weekday: "long", month: "long", day: "numeric",
  }).format(new Date(year!, month! - 1, day!, 12));
}

function formatCeremonyTime(wedding: WeddingConfig, language: Language) {
  return new Intl.DateTimeFormat(language === "te" ? "te-IN" : "en-US", {
    dateStyle: "long", timeStyle: "short", timeZone: wedding.ceremony.timeZone,
  }).format(new Date(getCeremonyTimestamp(wedding)));
}

function calendarLink(wedding: WeddingConfig) {
  const start = `${wedding.ceremony.date.replaceAll("-", "")}T${wedding.ceremony.time.replace(":", "")}00`;
  const [year, month, day] = wedding.ceremony.date.split("-").map(Number);
  const [hour, minute] = wedding.ceremony.time.split(":").map(Number);
  const endOffsetMinutes = hour! * 60 + minute! + 180;
  const endDate = new Date(Date.UTC(year!, month! - 1, day! + Math.floor(endOffsetMinutes / 1440)));
  const endHour = Math.floor((endOffsetMinutes % 1440) / 60);
  const endMinute = endOffsetMinutes % 60;
  const end = `${endDate.getUTCFullYear()}${String(endDate.getUTCMonth() + 1).padStart(2, "0")}${String(endDate.getUTCDate()).padStart(2, "0")}T${String(endHour).padStart(2, "0")}${String(endMinute).padStart(2, "0")}00`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(localized(wedding.couple.names, "en") + " wedding")}&dates=${start}/${end}&details=${encodeURIComponent(wedding.seo.description)}&location=${encodeURIComponent(`${localized(wedding.venue.name, "en")}, ${localized(wedding.venue.address, "en")}`)}&ctz=${encodeURIComponent(wedding.ceremony.timeZone)}`;
}

function LanguageSwitcher({ language, onChange }: { language: Language; onChange: (language: Language) => void }) {
  return (
    <div className="language-switch" aria-label="Invitation language">
      {(["en", "te"] as const).map((value) => (
        <button key={value} type="button" onClick={() => onChange(value)} aria-pressed={language === value}>
          {value === "en" ? "EN" : "తె"}
        </button>
      ))}
    </div>
  );
}

function TemplateSelector({ template, language, onChange }: { template: TemplateId; language: Language; onChange: (template: TemplateId) => void }) {
  const items: TemplateId[] = ["rajam", "aarambham", "mana-pelli"];
  return (
    <fieldset className="template-picker">
      <legend>{copy[language].design}</legend>
      <div className="template-options">
        {items.map((item, index) => (
          <button key={item} className={`template-option template-swatch-${item}`} type="button" aria-pressed={template === item} onClick={() => onChange(item)}>
            <span className="template-option-number">0{index + 1}</span>
            {copy[language].designs[item]}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function WeddingOpening({ wedding, language, open }: { wedding: WeddingConfig; language: Language; open: () => void }) {
  const text = copy[language];
  return (
    <section className="invitation-gate" aria-label={text.opening}>
      <div className="gate-image" role="img" aria-label={localized(wedding.couple.illustrationAlt, language)} />
      <div className="gate-shade" />
      <div className="gate-content">
        <span className="gate-mark"><Flower2 size={17} aria-hidden="true" /> LOVECRAFT</span>
        <span className="gate-collection">{text.opening}</span>
        <span className="gate-blessing">{localized(wedding.content.opening, language)}</span>
        <p className="gate-prompt">{text.openingHint}</p>
        <button className="button button-gold gate-button" type="button" onClick={open}>
          {text.open}<ArrowUpRight size={16} aria-hidden="true" />
        </button>
        <span className="gate-footnote">{formatDate(wedding.ceremony.date, language).toUpperCase()}</span>
      </div>
      <span className="gate-flower gate-flower-left" aria-hidden="true">✳</span>
      <span className="gate-flower gate-flower-right" aria-hidden="true">✳</span>
    </section>
  );
}

function CoupleHero({ wedding, language }: { wedding: WeddingConfig; language: Language }) {
  const text = copy[language];
  return (
    <section className="hero page-width" aria-labelledby="couple-title">
      <div className="hero-copy">
        <span className="eyebrow"><Sparkles size={14} aria-hidden="true" /> {localized(wedding.content.welcome, language)}</span>
        <span className="hero-script">{text.withJoy}</span>
        <h1 id="couple-title">{localized(wedding.couple.names, language)}</h1>
        <span className="hero-rule" aria-hidden="true"><i /><Heart size={14} /><i /></span>
        <p className="hero-intro">{localized(wedding.couple.intro, language)}</p>
        <span className="hero-date">{formatCeremonyTime(wedding, language)}</span>
        <span className="hero-venue"><MapPin size={15} aria-hidden="true" /> {localized(wedding.venue.name, language)}</span>
        <a href="#rsvp" className="button button-primary hero-cta">
          {language === "te" ? "వేడుకలకు విచ్చేయండి" : "Celebrate with us"}<ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
      <figure className="hero-image-frame">
        <img src={wedding.image} alt={localized(wedding.couple.illustrationAlt, language)} fetchPriority="high" />
        <figcaption>{language === "te" ? "ప్రేమతో, మీ కోసం" : "Made with love, for you"}</figcaption>
        <span className="hero-image-index" aria-hidden="true">01 — ∞</span>
      </figure>
    </section>
  );
}

function FamilyInvitation({ wedding, language }: { wedding: WeddingConfig; language: Language }) {
  const text = copy[language];
  return (
    <section className="family-section section-space" id="families">
      <div className="narrow-width family-inner">
        <span className="eyebrow"><Users size={14} aria-hidden="true" /> {text.withJoy}</span>
        <h2>{localized(wedding.families.invitation, language)}</h2>
        <div className="family-grid">
          {[{ person: wedding.families.bride, label: text.familyBride }, { person: wedding.families.groom, label: text.familyGroom }].map(({ person, label }) => (
            <article className="family-person" key={person.name.en}>
              <span className="family-label">{label}</span>
              <h3>{localized(person.name, language)}</h3>
              <p>{localized(person.family, language)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function MuhurthamCountdown({ wedding, language }: { wedding: WeddingConfig; language: Language }) {
  const [countdown, setCountdown] = useState<NonNullable<ReturnType<typeof getCountdownParts>> | null>(null);
  useEffect(() => {
    const update = () => setCountdown(getCountdownParts(wedding, Date.now()));
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [wedding]);

  if (!countdown || !wedding.visibility.countdown) return null;
  const text = copy[language];
  return (
    <section className="countdown-section section-space" aria-label={localized(wedding.ceremony.muhurtham, language)}>
      <div className="countdown-inner narrow-width">
        <span className="eyebrow"><Clock3 size={14} aria-hidden="true" /> {localized(wedding.ceremony.muhurtham, language)}</span>
        <h2>{text.countdown}</h2>
        <div className="countdown-grid" aria-live="off">
          {[{ value: countdown.days, label: text.days }, { value: countdown.hours, label: text.hours }, { value: countdown.minutes, label: text.minutes }, { value: countdown.seconds, label: text.seconds }].map(({ value, label }) => (
            <div className="countdown-item" key={label}><span>{String(value).padStart(2, "0")}</span><small>{label}</small></div>
          ))}
        </div>
        <span className="countdown-caption">{formatCeremonyTime(wedding, language)} · {wedding.ceremony.timeZone}</span>
      </div>
    </section>
  );
}

function WeddingTimeline({ wedding, language }: { wedding: WeddingConfig; language: Language }) {
  if (!wedding.visibility.events || wedding.events.length === 0) return null;
  const text = copy[language];
  return (
    <section className="events-section section-space" id="celebrations">
      <div className="page-width">
        <div className="section-heading"><span className="eyebrow"><Flower2 size={14} aria-hidden="true" /> {localized(wedding.content.welcome, language)}</span><h2>{text.events}</h2></div>
        <div className="events-grid">
          {wedding.events.map((event, index) => (
            <article className="event-item" key={event.id}>
              <span className="event-index">0{index + 1}</span>
              <span className="event-date">{formatDate(event.date, language)}</span>
              <h3>{localized(event.name, language)}</h3>
              <p className="event-detail"><Clock3 size={14} aria-hidden="true" /> {text.eventTime} {event.time}</p>
              <p className="event-detail"><MapPin size={14} aria-hidden="true" /> {localized(event.venue, language)}</p>
              {event.note && <p className="event-note">{localized(event.note, language)}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function VenueDetails({ wedding, language }: { wedding: WeddingConfig; language: Language }) {
  if (!wedding.visibility.venue) return null;
  const text = copy[language];
  return (
    <section className="venue-section section-space" id="venue">
      <div className="page-width venue-layout">
        <div className="venue-copy">
          <span className="eyebrow"><MapPin size={14} aria-hidden="true" /> {text.location}</span>
          <h2>{localized(wedding.venue.name, language)}</h2>
          <address>{localized(wedding.venue.address, language)}</address>
          <p className="venue-parking"><span>{text.parking}</span>{localized(wedding.venue.parking, language)}</p>
          <div className="venue-actions">
            <a className="button button-primary" href={wedding.venue.mapsUrl} target="_blank" rel="noreferrer">{text.directions}<ArrowUpRight size={15} aria-hidden="true" /></a>
            <a className="button button-outline" href={calendarLink(wedding)} target="_blank" rel="noreferrer"><CalendarDays size={16} aria-hidden="true" />{text.calendar}</a>
          </div>
          <a className="venue-contact" href={`tel:${wedding.venue.contactPhone}`}><Phone size={14} aria-hidden="true" /> {text.call}: {localized(wedding.venue.contactName, language)}</a>
        </div>
        <a className="venue-map" href={wedding.venue.mapsUrl} target="_blank" rel="noreferrer" aria-label={text.directions}>
          <span className="map-grid" aria-hidden="true" />
          <span className="map-pin"><MapPin size={22} aria-hidden="true" /></span>
          <span className="map-label">{localized(wedding.venue.name, language)}<ArrowUpRight size={14} aria-hidden="true" /></span>
          <span className="map-coordinates">HYDERABAD · TELANGANA</span>
        </a>
      </div>
    </section>
  );
}

function PhotoGallery({ wedding, language }: { wedding: WeddingConfig; language: Language }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const text = copy[language];
  const photos = wedding.visibility.gallery ? wedding.gallery : [];
  const dialogId = "photo-gallery-dialog";

  useEffect(() => {
    const dialog = document.getElementById(dialogId) as HTMLDialogElement | null;
    if (activeIndex !== null && !dialog?.open) dialog?.showModal();
    if (activeIndex === null && dialog?.open) dialog.close();
  }, [activeIndex]);

  if (photos.length === 0) return null;
  const photo = activeIndex === null ? null : photos[activeIndex];
  const changePhoto = (offset: number) => setActiveIndex((index) => (index === null ? null : (index + offset + photos.length) % photos.length));

  return (
    <section className="gallery-section section-space" aria-label={text.galleryTitle}>
      <div className="page-width">
        <div className="section-heading"><span className="eyebrow"><Flower2 size={14} aria-hidden="true" /> LOVE, IN FRAME</span><h2>{text.galleryTitle}</h2></div>
        <div className="gallery-grid">
          {photos.map((item, index) => (
            <button className="gallery-photo" type="button" key={`${item.src}-${index}`} onClick={() => setActiveIndex(index)} aria-label={`${text.galleryTitle}, ${index + 1}`}>
              <img src={item.src} alt={localized(item.alt, language)} loading="lazy" />
              <span className="gallery-photo-index">{String(index + 1).padStart(2, "0")}</span>
            </button>
          ))}
        </div>
      </div>
      <dialog id={dialogId} className="gallery-dialog" onClose={() => setActiveIndex(null)} onClick={(event) => { if (event.target === event.currentTarget) setActiveIndex(null); }} onKeyDown={(event) => { if (event.key === "ArrowLeft") changePhoto(-1); if (event.key === "ArrowRight") changePhoto(1); }}>
        {photo && <>
          <button className="gallery-close icon-button" type="button" onClick={() => setActiveIndex(null)} aria-label={text.closeGallery}><X size={22} /></button>
          <button className="gallery-previous icon-button" type="button" onClick={() => changePhoto(-1)} aria-label={text.previousPhoto}><ArrowLeft size={22} /></button>
          <figure className="gallery-dialog-figure"><img src={photo.src} alt={localized(photo.alt, language)} /><figcaption>{String(activeIndex! + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}</figcaption></figure>
          <button className="gallery-next icon-button" type="button" onClick={() => changePhoto(1)} aria-label={text.nextPhoto}><ArrowRight size={22} /></button>
        </>}
      </dialog>
    </section>
  );
}

function RSVPForm({ wedding, language }: { wedding: WeddingConfig; language: Language }) {
  const text = copy[language];
  const [attending, setAttending] = useState<"yes" | "no">("yes");
  const [guestCount, setGuestCount] = useState(1);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!wedding.visibility.rsvp || !wedding.rsvp.enabled) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const parsed = rsvpSchema.safeParse({
      name: data.get("name"),
      attending: data.get("attending"),
      guests: data.get("attending") === "no" ? 1 : Number(data.get("guests")),
      message: data.get("message") ?? "",
    });
    if (!parsed.success) {
      setError(parsed.error.issues.some((issue) => issue.path[0] === "name") ? text.nameRequired : text.guestRequired);
      return;
    }
    setError("");
    setSubmitted(true);
  }

  if (submitted) {
    return <section className="rsvp-section section-space" id="rsvp"><div className="rsvp-inner narrow-width"><span className="eyebrow"><Heart size={14} aria-hidden="true" /> LOVE, RECEIVED</span><h2>{text.rsvpSuccess}</h2><p className="rsvp-privacy">{text.rsvpDemo}</p></div></section>;
  }

  return (
    <section className="rsvp-section section-space" id="rsvp">
      <div className="rsvp-inner narrow-width">
        <span className="eyebrow"><Heart size={14} aria-hidden="true" /> {localized(wedding.content.welcome, language)}</span>
        <h2>{text.rsvpHeading}</h2>
        <p className="rsvp-deadline">{language === "te" ? "దయచేసి" : "Kindly reply by"} {formatDate(wedding.rsvp.deadline, language)}</p>
        <form className="rsvp-form" onSubmit={handleSubmit} noValidate>
          <label className="field-label" htmlFor="guest-name">{text.guestName}<span aria-hidden="true"> *</span></label>
          <input id="guest-name" name="name" autoComplete="name" maxLength={100} required />
          <fieldset className="attendance-fieldset">
            <legend>{text.attending}<span aria-hidden="true"> *</span></legend>
            <div className="attendance-options">
              <label className={`attendance-option${attending === "yes" ? " is-selected" : ""}`}><input type="radio" name="attending" value="yes" checked={attending === "yes"} onChange={() => setAttending("yes")} />{text.yes}</label>
              <label className={`attendance-option${attending === "no" ? " is-selected" : ""}`}><input type="radio" name="attending" value="no" checked={attending === "no"} onChange={() => { setAttending("no"); setGuestCount(1); }} />{text.no}</label>
            </div>
          </fieldset>
          <label className="field-label" htmlFor="guest-count">{text.guests}</label>
          <select id="guest-count" name="guests" value={guestCount} disabled={attending === "no"} onChange={(event) => setGuestCount(Number(event.target.value))}>
            {Array.from({ length: 10 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}
          </select>
          <label className="field-label" htmlFor="guest-message">{text.message}</label>
          <textarea id="guest-message" name="message" maxLength={500} placeholder={text.notePlaceholder} rows={3} />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary rsvp-submit" type="submit">{text.submit}<ArrowUpRight size={16} aria-hidden="true" /></button>
        </form>
        <p className="rsvp-privacy"><Heart size={12} aria-hidden="true" /> {text.privacy}</p>
      </div>
    </section>
  );
}

function WeddingFooter({ wedding, language }: { wedding: WeddingConfig; language: Language }) {
  const text = copy[language];
  const shareText = `${localized(wedding.couple.names, language)} · ${formatCeremonyTime(wedding, language)} · ${localized(wedding.venue.name, language)}`;
  return (
    <footer className="footer-section">
      <div className="footer-inner narrow-width">
        <Flower2 size={20} aria-hidden="true" className="footer-flower" />
        <p className="footer-closing">{localized(wedding.content.closing, language)}</p>
        <p className="footer-blessing">{localized(wedding.content.blessing, language)}</p>
        <a className="button button-share" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer"><span aria-hidden="true">↗</span> WhatsApp</a>
        <span className="footer-love">MADE WITH LOVE BY <strong>LOVECRAFT</strong></span>
        <span className="footer-fineprint">{text.fictional}</span>
      </div>
    </footer>
  );
}

export function WeddingSite({ wedding }: { wedding: WeddingConfig }) {
  const [current, setCurrent] = useState(wedding);
  const [language, setLanguage] = useState<Language>(wedding.language);
  const [opened, setOpened] = useState(!wedding.opening.enabled);

  useEffect(() => {
    document.documentElement.lang = language === "te" ? "te" : "en";
  }, [language]);

  useEffect(() => {
    if (!opened) return;
    const main = document.querySelector("main");
    main?.focus({ preventScroll: true });
  }, [opened]);

  const text = copy[language];

  return (
    <div className={`invitation invitation-${current.theme.template}`} lang={language === "te" ? "te" : "en"}>
      <header className="site-header page-width">
        <a className="site-brand" href="#top" aria-label="LoveCraft home"><Flower2 size={18} aria-hidden="true" /><span>LOVECRAFT</span></a>
        <span className="site-collection">MANA PELLI <span lang="te">· మన పెళ్లి</span></span>
        <LanguageSwitcher language={language} onChange={setLanguage} />
      </header>

      <TemplateSelector template={current.theme.template} language={language} onChange={(template) => setCurrent((previous) => switchWeddingTemplate(previous, template))} />

      <main id="top" tabIndex={-1}>
        <CoupleHero wedding={current} language={language} />
        {current.visibility.families && <FamilyInvitation wedding={current} language={language} />}
        <MuhurthamCountdown wedding={current} language={language} />
        <WeddingTimeline wedding={current} language={language} />
        <VenueDetails wedding={current} language={language} />
        <PhotoGallery wedding={current} language={language} />
        <RSVPForm wedding={current} language={language} />
        <WeddingFooter wedding={current} language={language} />
      </main>

      <div className={`gate-layer${opened || !current.opening.enabled ? " gate-layer-open" : ""}`} aria-hidden={opened || !current.opening.enabled} inert={opened || !current.opening.enabled}>
        <WeddingOpening wedding={current} language={language} open={() => setOpened(true)} />
      </div>
      {current.isDemo && <span className="demo-stamp">{text.demo}</span>}
    </div>
  );
}
