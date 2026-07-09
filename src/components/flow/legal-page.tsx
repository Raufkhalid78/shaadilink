"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Heart, FileText, Shield, RotateCcw, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CONTACT_CONFIG } from "@/lib/config";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import { useLanguage } from "@/components/language-provider";

type LegalType = "terms" | "privacy" | "refund" | "shipping";

interface LegalPageProps {
  type: LegalType;
  onBack: () => void;
}

const legalDataEn: Record<
  LegalType,
  {
    title: string;
    icon: typeof FileText;
    lastUpdated: string;
    sections: { heading: string; content: string }[];
  }
> = {
  terms: {
    title: "Terms & Conditions",
    icon: FileText,
    lastUpdated: "May 2026",
    sections: [
      {
        heading: "1. Introduction",
        content:
          "Welcome to ShaadiLink. ShaadiLink is owned and operated by TechyDez. By accessing and using our services, you agree to be bound by these Terms and Conditions. ShaadiLink provides premium digital wedding invitation webpages for Pakistani weddings.",
      },
      {
        heading: "2. Eligibility",
        content:
          "You must be at least 18 years of age to use our services. By using ShaadiLink, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into these terms.",
      },
      {
        heading: "3. Account Registration",
        content:
          "To create an invitation, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
      },
      {
        heading: "4. Payment Terms",
        content:
          "All prices are listed in Pakistani Rupees (PKR). Payment is one-time with no recurring charges or hidden fees. We accept all major credit/debit cards, JazzCash, EasyPaisa, and bank transfers. All payments are processed securely with SSL encryption.",
      },
      {
        heading: "5. Service Delivery",
        content:
          "Upon successful payment, you will receive immediate access to create your invitation webpage. Your invitation link will be generated instantly and can be shared with unlimited guests.",
      },
      {
        heading: "6. User Responsibilities",
        content:
          "You are responsible for the accuracy of all information provided in your invitation. You agree not to use our service for any unlawful purpose or to distribute content that is offensive, harmful, or violates third-party rights.",
      },
      {
        heading: "7. Intellectual Property",
        content:
          "All templates, designs, and code are the property of ShaadiLink. You may not reproduce, distribute, or create derivative works from our templates without explicit permission.",
      },
      {
        heading: "8. Service Availability",
        content:
          "We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service. Scheduled maintenance will be communicated in advance. Your invitation pages will remain accessible for at least 30 days after your wedding date.",
      },
      {
        heading: "9. Business Entity & Governing Law",
        content:
          "These Terms and Conditions constitute a legally binding agreement between you and TechyDez (the parent company operating ShaadiLink). Our registered business address is Jhelum, Punjab, Pakistan. These terms are governed by the laws of the Islamic Republic of Pakistan and you agree that the courts of Jhelum will have exclusive jurisdiction in any dispute.",
      },
      {
        heading: "10. Complaint Handling Mechanism",
        content:
          "In order to resolve a complaint regarding our services or require support, please contact us by calling +447517879333 or send us an email at hello@techydez.com.",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    icon: Shield,
    lastUpdated: "May 2026",
    sections: [
      {
        heading: "1. Data We Collect",
        content:
          "We collect information you provide directly: your name, email, wedding details (couple names, venue, events, dates), guest messages, and RSVP responses. We also collect usage data such as page views and device information.",
      },
      {
        heading: "2. Google User Data & Authentication",
        content:
          "ShaadiLink uses Google Sign-In for secure authentication. When you log in with Google, we securely collect your basic profile information (name and email address). This data is used exclusively to create your personal dashboard and authenticate your identity, allowing you to save, edit, and manage your wedding invitations. We do not sell, share, or use your Google user data for any other purpose.",
      },
      {
        heading: "3. How We Use Your Data",
        content:
          "Your data is used to create and deliver your invitation webpage, process payments, provide customer support, and improve our services. We never sell your personal data to third parties.",
      },
      {
        heading: "4. Payment Data",
        content:
          "Payment processing is handled by our secure payment partners. ShaadiLink does not store your full credit card details. All payment data is transmitted via encrypted SSL connections and processed in compliance with PCI-DSS standards.",
      },
      {
        heading: "5. Data Protection",
        content:
          "We implement industry-standard security measures to protect your data, including encryption, secure servers, and access controls. Your invitation page is only accessible via the unique link you share.",
      },
      {
        heading: "6. Cookies",
        content:
          "We use essential cookies to ensure the proper functioning of our website and analytics cookies to understand how visitors interact with our service. You can manage cookie preferences through your browser settings.",
      },
      {
        heading: "7. Data Retention",
        content:
          "Your invitation page will remain publicly accessible until 30 days after your wedding date, after which it will be automatically set to private. Account data is retained as long as your account is active.",
      },
      {
        heading: "8. Your Rights",
        content:
          `You have the right to access, correct, or delete your personal data at any time. Contact us at ${CONTACT_CONFIG.email} for any data-related requests.`,
      },
    ],
  },
  refund: {
    title: "Refund Policy",
    icon: RotateCcw,
    lastUpdated: "May 2026",
    sections: [
      {
        heading: "1. General Policy",
        content:
          "All purchases on ShaadiLink are final. As our service provides immediate digital access to premium templates and invitation creation tools, we are unable to offer refunds once the service has been accessed.",
      },
      {
        heading: "2. Duplicate Payments",
        content:
          `If a duplicate payment occurs due to a technical error, we will review the transaction and process a refund after deducting applicable processing charges. Please contact us at ${CONTACT_CONFIG.email} with your transaction details.`,
      },
      {
        heading: "3. Erroneous Payments",
        content:
          "In cases of clearly erroneous payments (e.g., wrong amount charged), we will investigate and process a refund within 7–10 business days after verification.",
      },
      {
        heading: "4. Coupon Codes",
        content:
          "Coupon codes and promotional discounts cannot be applied retroactively to completed purchases. Each code may only be used once per account.",
      },
      {
        heading: "5. Service Issues",
        content:
          "If you experience technical issues that prevent you from using our service, please contact our support team first. We will make every effort to resolve the issue before considering a refund request.",
      },
      {
        heading: "6. Refund Processing",
        content:
          "Approved refunds will be processed back to the original payment method within 7–10 business days. Processing times may vary depending on your bank or payment provider.",
      },
    ],
  },
  shipping: {
    title: "Shipping & Delivery Policy",
    icon: Truck,
    lastUpdated: "May 2026",
    sections: [
      {
        heading: "1. Digital Service",
        content:
          "ShaadiLink is a 100% digital service. There are no physical products, printed cards, or tangible items shipped to your address.",
      },
      {
        heading: "2. Instant Delivery",
        content:
          "Upon successful payment, you will receive immediate access to your dashboard where you can create and customize your invitation. Your unique invitation link is generated instantly.",
      },
      {
        heading: "3. Access Via Dashboard",
        content:
          "All your invitations, editing tools, and sharing features are accessible through your online dashboard. Simply log in to manage everything from any device.",
      },
      {
        heading: "4. Email Confirmation",
        content:
          "You will receive an email confirmation after purchase with your account details and instructions for accessing your invitation dashboard.",
      },
      {
        heading: "5. No Physical Shipping",
        content:
          "Since ShaadiLink provides only digital products, there are no shipping charges, delivery delays, or physical logistics involved. Everything is available instantly online.",
      },
    ],
  },
};

const legalDataUr: Record<
  LegalType,
  {
    title: string;
    icon: typeof FileText;
    lastUpdated: string;
    sections: { heading: string; content: string }[];
  }
> = {
  terms: {
    title: "شرائط و ضوابط",
    icon: FileText,
    lastUpdated: "مئی 2026",
    sections: [
      {
        heading: "1۔ تعارف",
        content:
          "شادی لنک میں خوش آمدید۔ شادی لنک کی ملکیت اور انتظام TechyDez کے پاس ہے۔ ہماری سروس استعمال کر کے آپ ان شرائط و ضوابط کے پابند ہونے پر رضامندی دیتے ہیں۔ شادی لنک پاکستانی شادیوں کے لیے پریمیم ڈیجیٹل شادی دعوت نامے فراہم کرتا ہے۔",
      },
      {
        heading: "2۔ اہلیت",
        content:
          "ہماری سروسز استعمال کرنے کے لیے آپ کی عمر کم از کم 18 سال ہونی چاہیے۔ شادی لنک استعمال کر کے، آپ تصدیق کرتے ہیں کہ آپ کی عمر کم از کم 18 سال ہے اور آپ قانونی طور پر ان شرائط کو قبول کرنے کے اہل ہیں۔",
      },
      {
        heading: "3۔ اکاؤنٹ کی رجسٹریشن",
        content:
          "دعوت نامہ بنانے کے لیے، آپ کو اکاؤنٹ رجسٹر کرنا ہوگا۔ آپ اپنے اکاؤنٹ کی تفصیلات کو خفیہ رکھنے اور اپنے اکاؤنٹ کے تحت ہونے والی تمام سرگرمیوں کے ذمہ دار ہیں۔",
      },
      {
        heading: "4۔ ادائیگی کی شرائط",
        content:
          "تمام قیمتیں پاکستانی روپوں (PKR) میں ہیں۔ ادائیگی یک وقتی ہے اور اس میں کوئی ماہانہ چارجز یا پوشیدہ فیس نہیں ہے۔ ہم تمام کریڈٹ/ڈیبیٹ کارڈز، جاز کیش، ایزی پیسہ، اور بینک ٹرانسفرز قبول کرتے ہیں۔ تمام ادائیگیاں SSL انکرپشن کے ساتھ محفوظ طریقے سے عمل میں لائی جاتی ہیں۔",
      },
      {
        heading: "5۔ سروس کی فراہمی",
        content:
          "کامیاب ادائیگی پر، آپ کو اپنے دعوت نامہ کا پیج بنانے کے لیے فوری رسائی دی جائے گی۔ آپ کا دعوت نامہ لنک فوری طور پر بن جائے گا اور آپ اسے لامحدود مہمانوں کے ساتھ شیئر کر سکتے ہیں۔",
      },
      {
        heading: "6۔ صارف کی ذمہ داریاں",
        content:
          "آپ اپنے دعوت نامے میں فراہم کردہ تمام معلومات کی درستگی کے ذمہ دار ہیں۔ آپ ہماری سروس کو کسی غیر قانونی مقصد کے لیے یا کسی ایسے مواد کو شیئر کرنے کے لیے استعمال نہ کرنے پر متفق ہیں جو نقصان دہ یا غیر اخلاقی ہو۔",
      },
      {
        heading: "7۔ ملکیتی حقوق",
        content:
          "تمام ڈیزائنز، ٹیمپلیٹس اور کوڈ شادی لنک کی ملکیت ہیں۔ آپ ہماری اجازت کے بغیر ہمارے ڈیزائنز کو دوبارہ فروخت یا کاپی نہیں کر سکتے۔",
      },
      {
        heading: "8۔ سروس کی دستیابی",
        content:
          "ہم ویب سائٹ کی 99.9% دستیابی کو یقینی بنانے کی کوشش کرتے ہیں لیکن کسی بھی تکنیکی خرابی کی صورت میں مستقل دستیابی کی ضمانت نہیں دیتے۔ آپ کے دعوت نامہ صفحات شادی کی تاریخ کے کم از کم 30 دن بعد تک آن لائن رہیں گے۔",
      },
      {
        heading: "9۔ کاروباری ادارہ اور گورننگ لاء",
        content:
          "یہ شرائط و ضوابط آپ اور ٹیک ڈیز (TechyDez - شادی لنک کی پیرنٹ کمپنی) کے درمیان ایک قانونی معاہدہ ہیں۔ ہمارا رجسٹرڈ کاروباری پتہ جہلم، پنجاب، پاکستان ہے۔ یہ شرائط اسلامی جمہوریہ پاکستان کے قوانین کے تابع ہیں اور آپ اتفاق کرتے ہیں کہ کسی بھی تنازعے کی صورت میں جہلم کی عدالتوں کو خصوصی اختیار حاصل ہوگا۔",
      },
      {
        heading: "10۔ شکایات کے ازالے کا طریقہ کار",
        content:
          "ہماری سروسز کے حوالے سے کسی بھی شکایت کے ازالے یا مدد کے لیے، براہ کرم ہمیں +447517879333 پر کال کریں یا hello@techydez.com پر ای میل بھیجیں۔",
      },
    ],
  },
  privacy: {
    title: "پرائیویسی پالیسی",
    icon: Shield,
    lastUpdated: "مئی 2026",
    sections: [
      {
        heading: "1۔ جمع کردہ معلومات",
        content:
          "ہم آپ کی فراہم کردہ معلومات جمع کرتے ہیں: آپ کا نام، ای میل، شادی کی تفصیلات (دولہا دولہن کا نام، تاریخ، مقام)، مہمانوں کے پیغامات اور RSVP جوابات۔",
      },
      {
        heading: "2۔ گوگل ڈیٹا اور سائن ان",
        content:
          "شادی لنک گوگل سائن ان کا استعمال جوڑوں کی شناخت کی تصدیق اور ان کا ڈیش بورڈ بنانے کے لیے کرتا ہے۔ آپ کے گوگل اکاؤنٹ کی تفصیلات (نام اور ای میل) صرف آپ کے دعوت ناموں کو محفوظ رکھنے اور ان میں تبدیلیاں کرنے کے لیے استعمال کی جاتی ہیں۔ ہم آپ کا گوگل ڈیٹا کسی کے ساتھ شیئر نہیں کرتے۔",
      },
      {
        heading: "3۔ معلومات کا استعمال",
        content:
          "آپ کا ڈیٹا دعوت نامہ پیج بنانے، ادائیگی مکمل کرنے، اور کسٹمر سپورٹ فراہم کرنے کے لیے استعمال ہوتا ہے۔ ہم آپ کا ذاتی ڈیٹا کبھی کسی تیسری پارٹی کو فروخت نہیں کرتے۔",
      },
      {
        heading: "4۔ پیمنٹ ڈیٹا سیکیورٹی",
        content:
          "پیمنٹ کا عمل ہمارے محفوظ ادائیگی کے پارٹنرز سنبھالتے ہیں۔ شادی لنک آپ کے کارڈ کی تفصیلات محفوظ نہیں کرتا۔ تمام ادائیگی SSL سیکیورٹی کے تحت عمل میں لائی جاتی ہے۔",
      },
      {
        heading: "5۔ ڈیٹا کی حفاظت",
        content:
          "ہم آپ کے ڈیٹا کی حفاظت کے لیے انڈسٹری کے بہترین معیار کی سیکیورٹی استعمال کرتے ہیں۔ آپ کا دعوت نامہ صرف اس لنک کے ذریعے کھولا جا سکتا ہے جو آپ خود شیئر کرتے ہیں۔",
      },
      {
        heading: "6۔ کوکیز (Cookies)",
        content:
          "ہم ویب سائٹ کو بہتر بنانے کے لیے بنیادی کوکیز کا استعمال کرتے ہیں۔ آپ اپنے براؤزر کی سیٹنگز سے کوکیز کو بند بھی کر سکتے ہیں۔",
      },
      {
        heading: "7۔ ڈیٹا برقرار رکھنا",
        content:
          "آپ کا دعوت نامہ پیج شادی کی تاریخ کے 30 دن بعد تک آن لائن رہے گا، جس کے بعد پرائیویسی کے پیش نظر اسے خودکار طور پر پرائیویٹ کر دیا جائے گا۔",
      },
      {
        heading: "8۔ آپ کے حقوق",
        content:
          `آپ کو کسی بھی وقت اپنے ذاتی ڈیٹا کو تبدیل کرنے یا حذف کرنے کا پورا حق حاصل ہے۔ ڈیٹا سے متعلق کسی بھی درخواست کے لیے ہم سے ${CONTACT_CONFIG.email} پر رابطہ کریں۔`,
      },
    ],
  },
  refund: {
    title: "رقم کی واپسی کی پالیسی",
    icon: RotateCcw,
    lastUpdated: "مئی 2026",
    sections: [
      {
        heading: "1۔ عام پالیسی",
        content:
          "شادی لنک پر تمام خریداریاں حتمی ہیں۔ چونکہ ہماری سروس ڈیجیٹل پروڈکٹس اور ٹیمپلیٹس تک فوری رسائی فراہم کرتی ہے، اس لیے ہم سروس استعمال شروع کرنے کے بعد رقم واپس کرنے سے قاصر ہیں۔",
      },
      {
        heading: "2۔ دوہری ادائیگی",
        content:
          `اگر کسی تکنیکی خرابی کی وجہ سے دو بار ادائیگی ہو جائے، تو ہم جائزہ لے کر پروسیسنگ چارجز منہا کرنے کے بعد رقم واپس کر دیں گے۔ برائے مہربانی ٹرانزیکشن کی تفصیلات کے ساتھ ${CONTACT_CONFIG.email} پر رابطہ کریں۔`,
      },
      {
        heading: "3۔ غلط ادائیگی",
        content:
          "کسی بھی واضح تکنیکی غلطی (مثلاً غلط رقم چارج ہونا) کی صورت میں، ہم تصدیق کے بعد 7 سے 10 کاروباری دنوں کے اندر رقم واپس کر دیں گے۔",
      },
      {
        heading: "4۔ کوپن کوڈز",
        content:
          "پروموشنل ڈسکاؤنٹ یا کوپن کوڈز خریداری مکمل ہونے کے بعد لاگو نہیں کیے جا سکتے۔ ہر کوڈ صرف ایک بار ہی استعمال کیا جا سکتا ہے۔",
      },
      {
        heading: "5۔ تکنیکی مسائل",
        content:
          "اگر آپ کو سروس استعمال کرنے میں کوئی تکنیکی مسئلہ درپیش ہو، تو ہماری سپورٹ ٹیم سے رابطہ کریں۔ ہم اسے حل کرنے کی ہر ممکن کوشش کریں گے۔",
      },
      {
        heading: "6۔ رقم کی واپسی کا عمل",
        content:
          "منظور شدہ رقم کی واپسی 7 سے 10 کاروباری دنوں کے اندر آپ کے اصل ادائیگی کے طریقے (کارڈ یا اکاؤنٹ) پر منتقل کر دی جائے گی۔",
      },
    ],
  },
  shipping: {
    title: "شپنگ اور ڈیلیوری پالیسی",
    icon: Truck,
    lastUpdated: "مئی 2026",
    sections: [
      {
        heading: "1۔ ڈیجیٹل سروس",
        content:
          "شادی لنک 100% ڈیجیٹل سروس ہے۔ آپ کے ایڈریس پر کوئی فزیکل پروڈکٹ، پرنٹ شدہ کارڈ، یا کوئی فزیکل سامان نہیں بھیجا جاتا۔",
      },
      {
        heading: "2۔ فوری ڈیلیوری",
        content:
          "ادائیگی مکمل ہوتے ہی آپ کو فوری طور پر ڈیش بورڈ تک رسائی مل جائے گی جہاں آپ اپنا کارڈ بنا سکتے ہیں۔ آپ کا دعوتی لنک فوری طور پر تیار ہو جاتا ہے۔",
      },
      {
        heading: "3۔ ڈیش بورڈ کے ذریعے رسائی",
        content:
          "آپ کے تمام دعوت نامے اور ان میں ترمیم کرنے کی سہولت ڈیش بورڈ پر دستیاب ہے۔ آپ کسی بھی موبائل یا کمپیوٹر سے لاگ ان کر کے اسے استعمال کر سکتے ہیں۔",
      },
      {
        heading: "4۔ تصدیقی ای میل",
        content:
          "خریداری کے بعد آپ کو ایک تصدیقی ای میل موصول ہوگی جس میں لاگ ان کی تفصیلات اور ڈیش بورڈ استعمال کرنے کے طریقے بتائے جائیں گے۔",
      },
      {
        heading: "5۔ کوئی فزیکل شپنگ چارجز نہیں",
        content:
          "چونکہ شادی لنک صرف ڈیجیٹل پروڈکٹس فراہم کرتا ہے، اس لیے شپنگ کے کوئی چارجز یا ڈیلیوری میں تاخیر کا کوئی امکان نہیں ہے۔ سب کچھ سیکنڈوں میں آن لائن دستیاب ہے۔",
      },
    ],
  },
};

export function LegalPage({ type, onBack }: LegalPageProps) {
  const { t, language } = useLanguage();
  const data = language === 'en' ? legalDataEn[type] : legalDataUr[type];
  const Icon = data.icon;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={onBack}
              className="gap-2 text-foreground/70 hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">
                {language === 'en' ? "Back" : "پیچھے"}
              </span>
            </Button>

            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald text-primary-foreground">
                <Heart className="h-4 w-4 fill-current" />
              </div>
              <span className="font-display text-lg font-bold">
                Shaadi<span className="text-gold">Link</span>
              </span>
            </div>

            <div className="w-16" />
          </div>
        </div>
      </header>

      {/* Breadcrumb path — title adapts to the legal page type */}
      <PageBreadcrumb
        crumbs={[
          { label: language === 'en' ? "Home" : "ہوم", onClick: onBack },
          { label: data.title },
        ]}
      />

      <main id="main-content" className="flex-1 py-12 sm:py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-left"
        >
          {/* Title */}
          <div className="flex items-center gap-3 mb-2 justify-start">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
              <Icon className="h-5 w-5" />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              {data.title}
            </h1>
          </div>
          <p className="text-muted-foreground text-sm mb-10 text-left">
            {language === 'en' ? "Last updated: " : "آخری اپ ڈیٹ: "}{data.lastUpdated}
          </p>

          {/* Sections */}
          <div className="space-y-8 text-left">
            {data.sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="text-left"
              >
                <h2 className="font-display text-lg font-semibold text-foreground mb-2 text-left">
                  {section.heading}
                </h2>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base text-left">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Contact note */}
          <div className="mt-12 p-5 rounded-xl border border-gold/20 bg-gold/5 text-left">
            <p className="text-sm text-muted-foreground text-left">
              {language === 'en' ? "Have questions about our policies? " : "کیا آپ کے پاس ہماری پالیسیوں کے بارے میں سوالات ہیں؟ "}
              <span className="text-gold font-medium">
                {language === 'en' ? "Contact us" : "ہم سے رابطہ کریں"}
              </span>{" "}
              {language === 'en' ? "at" : "پر"}{" "}
              <a
                href={`mailto:${CONTACT_CONFIG.email}`}
                className="text-gold hover:text-gold-light underline"
              >
                {CONTACT_CONFIG.email}
              </a>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
