"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does the digital invitation work?",
    answer:
      "After creating your invitation, you get a unique link that you can share with guests via WhatsApp, email, or social media. When guests open the link, they see a stunning animated webpage with your wedding details, door-opening animation, scratch card, countdown timer, and more.",
  },
  {
    question: "Can I edit my invitation after creating it?",
    answer:
      "Yes! You can make unlimited edits to your invitation right up until your wedding date. Change venue details, update event times, modify your welcome message — everything is fully editable from your dashboard.",
  },
  {
    question: "How many invitations can I create?",
    answer:
      "Each purchase gives you one beautifully crafted invitation. However, you can create additional invitations by purchasing again. Many families create separate invitations for Mehndi, Baraat, and Walima events.",
  },
  {
    question: "Is there a limit on how many guests can view my invitation?",
    answer:
      "Absolutely not! Share your invitation link with as many guests as you want — there are no per-guest charges or viewing limits. One link, infinite reach.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We accept all major credit/debit cards (Visa, Mastercard), JazzCash, EasyPaisa, and bank transfers. All payments are processed securely with SSL encryption.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "We offer a full refund within 24 hours of purchase if you haven't shared the invitation link yet. After that, we provide credit for future purchases. Please see our Refund Policy for complete details.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function FAQ() {
  return (
    <section id="faq" className="py-20 sm:py-28 bg-gradient-to-b from-muted/30 to-background">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14 sm:mb-20 reveal-on-scroll">
          <span className="inline-block font-calligraphy text-gold text-lg mb-3">
            ✦ FAQ ✦
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            Frequently Asked{" "}
            <span className="gold-shimmer">Questions</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-base sm:text-lg">
            Everything you need to know about ShaadiLink digital invitations.
          </p>
        </div>

        {/* FAQ Accordion */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <motion.div key={index} variants={itemVariants}>
                <AccordionItem
                  value={`item-${index}`}
                  className="border border-border/50 rounded-xl px-6 bg-card data-[state=open]:border-gold/30 data-[state=open]:shadow-md data-[state=open]:shadow-gold/5 transition-all duration-300"
                >
                  <AccordionTrigger className="text-left font-display text-base sm:text-lg font-semibold text-foreground hover:text-gold hover:no-underline py-5 transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm sm:text-base leading-relaxed pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
