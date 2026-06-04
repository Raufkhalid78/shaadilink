/* ---------- Shared Flow Types & Data ---------- */

export interface FlowData {
  // Step 1: Plan selection
  selectedPlan: "classic" | "royal" | null;
  // Step 2: Template selection
  selectedTemplateId: string | null;
  // Step 3: Account creation
  fullName: string;
  email: string;
  password: string;
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
  // Photos
  heroImage: string;
  slideshowImages: string[];
  // Step 5: Payment (simulated)
  paymentDone: boolean;
}

export const initialFlowData: FlowData = {
  selectedPlan: null,
  selectedTemplateId: null,
  fullName: "",
  email: "",
  password: "",
  partner1Name: "",
  partner2Name: "",
  venue: "",
  venueAddress: "",
  welcomeMessage: "",
  events: [
    { name: "Mehndi", date: "", time: "" },
    { name: "Baraat", date: "", time: "" },
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
  paymentDone: false,
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
  | "shipping";

export const planDetails = {
  classic: {
    name: "Classic",
    price: "2,499",
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
    price: "3,999",
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
      "Premium Motion Storytelling",
      "Priority Support",
    ],
  },
};
