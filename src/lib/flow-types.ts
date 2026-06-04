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
  welcomeMessage: string;
  events: { name: string; date: string; time: string }[];
  backgroundMusic: string;
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
  welcomeMessage: "",
  events: [
    { name: "Mehndi", date: "", time: "" },
    { name: "Baraat", date: "", time: "" },
    { name: "Walima", date: "", time: "" },
  ],
  backgroundMusic: "soft-sitar",
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
  | "demo";

export const planDetails = {
  classic: {
    name: "Classic",
    price: "2,499",
    priceNote: "One-time payment",
    features: [
      "1 Invitation",
      "Door Animation",
      "RSVP Collection",
      "Countdown Timer",
      "8 Classic Templates",
      "Share via Link",
    ],
  },
  royal: {
    name: "Royal",
    price: "3,999",
    priceNote: "One-time payment",
    features: [
      "Everything in Classic",
      "Scratch Card Reveal",
      "Fireworks & Effects",
      "Background Music",
      "Photo Gallery",
      "Custom Domain",
      "2 Premium Templates",
      "Priority Support",
    ],
  },
};
