/* ---------- Shared Flow Types & Data ---------- */

export interface FlowData {
  // Step 1: Plan selection
  selectedPlan: "classic" | "royal" | null;
  // Step 2: Template selection
  selectedTemplateId: string | null;
  category?: string;
  // Step 3: Account creation (password never stored here — Supabase handles it)
  fullName: string;
  email: string;
  // Step 4: Invitation details
  partner1Name: string;
  partner2Name: string;
  venue: string;
  venueAddress: string;
  welcomeMessage: string;
  events: { id?: string; name: string; date: string; time: string; venue?: string }[];
  backgroundMusic: string;
  // Dress code
  dressCodeWomen: string;
  dressCodeMen: string;
  // Transportation
  transportation: string;
  // Accommodation
  accommodation: string;
  // Gifts/Registry
  gifts: string;
  hideDigitalShagun?: boolean;
  // Photos (real Supabase Storage URLs after upload)
  heroImage: string;
  slideshowImages: string[];
  youtubeVideoId: string;
  // Step 5: Payment (simulated)
  paymentDone: boolean;
  // Plan upgrades
  originalPlan?: string;
  // Add-ons
  guestLinksQuota: number;
  // Baseline quota for tracking new additions during upgrades
  originalGuestLinksQuota?: number;
  // Guest-specific event filtering (null = show all events)
  guestAllowedEvents?: string[] | null;
  // How many persons are invited via this guest link
  guestSeats?: number | null;
  // Backend IDs — set after API calls
  userId?: string;
  invitationId?: string;
  // Islamic opening — shown at top of invitation
  showBismillah: boolean;
  showQuranVerse: boolean;
  // Custom verse — user can override the default Quran verse with any text
  customVerseText?: string;    // The verse text (Arabic, English, or any language)
  customVerseSource?: string;  // The source/reference e.g. "Surah Al-Rum 30:21" or "John 3:16"
  slug?: string;
  // Pakistani Wedding Optional Features
  primaryHostFamily?: string;
  secondaryHostFamily?: string;
  primaryHostCity?: string;
  secondaryHostCity?: string;
  contactPhone?: string;
  isSegregated?: boolean;
  venueDetailsSegregated?: string;
  showNikahRegistration?: boolean;
  // Multi-step builder progress persistence
  currentStep?: number;
  lastSavedStep?: number;
  // Custom Music for Royal Tier
  customMusicUrl?: string;
  customMusicName?: string;
  // Personal Host Voice Greeting (Audio Memo)
  voiceNoteUrl?: string;
  voiceNoteTitle?: string;
  voiceNoteSender?: string;
  // Agency / White-label branding & Client Review
  agencyName?: string;
  agencyPhone?: string;
  whiteLabelFooter?: string;
  clientApprovalStatus?: "pending" | "approved" | "changes_requested";
  clientApprovalNotes?: string;
  clientApprovedAt?: string;
}

export function getDefaultEventsForCategory(category?: string | null): { name: string; date: string; time: string }[] {
  const cat = (category || "").toLowerCase();
  if (cat === "birthday") {
    return [
      { name: "Arrival & Welcome Drinks", date: "", time: "7:00 PM" },
      { name: "Cake Cutting Ceremony", date: "", time: "8:30 PM" },
      { name: "Dinner & Celebration", date: "", time: "9:00 PM" },
      { name: "Music & Afterparty", date: "", time: "10:00 PM" },
    ];
  }
  if (cat === "school") {
    return [
      { name: "Guest Registration & Seating", date: "", time: "5:00 PM" },
      { name: "Opening Ceremony & Speeches", date: "", time: "6:00 PM" },
      { name: "Awards & Diplomas Presentation", date: "", time: "7:00 PM" },
      { name: "Dinner & Celebration Gala", date: "", time: "8:30 PM" },
    ];
  }
  if (cat === "meeting" || cat === "corporate") {
    return [
      { name: "Registration & Welcome Coffee", date: "", time: "9:00 AM" },
      { name: "Keynote Address", date: "", time: "10:00 AM" },
      { name: "Panel Discussion & Q&A", date: "", time: "11:30 AM" },
      { name: "Networking Lunch & Closing", date: "", time: "1:00 PM" },
    ];
  }
  return [
    { name: "Qawali Night", date: "", time: "" },
    { name: "Dholki", date: "", time: "" },
    { name: "Mayoon", date: "", time: "" },
    { name: "Mehndi", date: "", time: "" },
    { name: "Baraat", date: "", time: "" },
    { name: "Baraat & Nikkah", date: "", time: "" },
    { name: "Walima", date: "", time: "" },
  ];
}

export function getDefaultMusicForCategory(category?: string | null): string {
  const cat = (category || "").toLowerCase();
  if (cat === "birthday") return "party-vibes";
  if (cat === "school") return "anthem-celebration";
  if (cat === "meeting" || cat === "corporate") return "corporate-ambient";
  return "soft-sitar";
}


export const initialFlowData: FlowData = {
  selectedPlan: null,
  selectedTemplateId: null,
  fullName: "",
  email: "",
  currentStep: 1,
  lastSavedStep: 1,
  partner1Name: "",
  partner2Name: "",
  venue: "",
  venueAddress: "",
  welcomeMessage: "",
  events: [
    { name: "Qawali Night", date: "", time: "" },
    { name: "Dholki", date: "", time: "" },
    { name: "Mayoon", date: "", time: "" },
    { name: "Mehndi", date: "", time: "" },
    { name: "Baraat", date: "", time: "" },
    { name: "Baraat & Nikkah", date: "", time: "" },
    { name: "Walima", date: "", time: "" },
  ],
  backgroundMusic: "soft-sitar",
  dressCodeWomen: "",
  dressCodeMen: "",
  transportation: "",
  accommodation: "",
  gifts: "",
  heroImage: "",
  slideshowImages: [],
  youtubeVideoId: "",
  showBismillah: true,
  showQuranVerse: true,
  customVerseText: "",
  customVerseSource: "",
  paymentDone: false,
  guestLinksQuota: 0,
  originalGuestLinksQuota: 0,
  slug: "",
  primaryHostFamily: "",
  secondaryHostFamily: "",
  primaryHostCity: "",
  secondaryHostCity: "",
  contactPhone: "",
  isSegregated: false,
  venueDetailsSegregated: "",
  showNikahRegistration: false,
};

export type FlowStep =
  | "landing"
  | "templates"
  | "signup"
  | "login"
  | "details"
  | "payment"
  | "success"
  | "demo"
  | "about"
  | "contact"
  | "affiliate"
  | "terms"
  | "privacy"
  | "refund"
  | "shipping"
  | "dashboard";

export const planDetails = {
  classic: {
    name: "Classic",
    price: "3,499",
    priceNote: "One-time payment",
    features: [
      "1 Invitation Webpage",
      "Door Animation",
      "RSVP Collection",
      "Countdown Timer",
      "8 Classic Templates",
      "Share via Link",
      "Unlimited Edits",
      "Guest Messaging & Inbox",
      "Music, Photos & Custom Uploads",
      "Google Maps & Multi-Language",
      "Analytics & Page View Tracking",
      "Auto Privacy After Wedding",
    ],
  },
  royal: {
    name: "Royal",
    price: "5,799",
    priceNote: "One-time payment",
    features: [
      "Everything in Classic",
      "Access to ALL Classic + Royal Templates",
      "10 Premium Animated Templates",
      "Scratch Card Reveal",
      "Fireworks & Cinematic Effects",
      "Background Music",
      "Photo Gallery & Slideshow",
      "Custom Domain",
      "3D Door & Curtain Reveal",
      "Add to Calendar Integration",
      "Pakistani Digital Shagun & Registry",
      "Dress Code Swatches (Ladies/Gentlemen)",
      "Travel & Accommodation Info Blocks",
      "Premium Motion Storytelling",
      "Priority Support",
    ],
  },
};
