/* ---------- Shared Flow Types & Data ---------- */

export interface FlowData {
  // Step 1: Plan selection
  selectedPlan: "classic" | "royal" | null;
  // Step 2: Template selection
  selectedTemplateId: string | null;
  // Step 3: Account creation (password never stored here — Supabase handles it)
  fullName: string;
  email: string;
  // Step 4: Invitation details
  partner1Name: string;
  partner2Name: string;
  venue: string;
  venueAddress: string;
  welcomeMessage: string;
  events: { name: string; date: string; time: string; venue?: string }[];
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
  // Photos (real Supabase Storage URLs after upload)
  heroImage: string;
  slideshowImages: string[];
  youtubeVideoId: string;
  // Step 5: Payment (simulated)
  paymentDone: boolean;
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
  slug?: string;
  // Pakistani Wedding Optional Features
  hostBrideFamily?: string;
  hostGroomFamily?: string;
  hostBrideCity?: string;
  hostGroomCity?: string;
  contactPhone?: string;
  isSegregated?: boolean;
  venueDetailsSegregated?: string;
  showNikahRegistration?: boolean;
}

export const initialFlowData: FlowData = {
  selectedPlan: null,
  selectedTemplateId: null,
  fullName: "",
  email: "",
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
  paymentDone: false,
  guestLinksQuota: 0,
  originalGuestLinksQuota: 0,
  slug: "",
  hostBrideFamily: "",
  hostGroomFamily: "",
  hostBrideCity: "",
  hostGroomCity: "",
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
