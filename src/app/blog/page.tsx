import { getAllPosts } from "@/lib/markdown";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | ShaadiLink",
  description: "Read the latest tips, trends, and news about Pakistani wedding invitations on the ShaadiLink blog.",
  openGraph: {
    title: "Blog | ShaadiLink",
    description: "Read the latest tips, trends, and news about Pakistani wedding invitations on the ShaadiLink blog.",
    type: "website",
    locale: "en_PK",
    siteName: "ShaadiLink",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ShaadiLink - Premium Digital Wedding Invitations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | ShaadiLink",
    description: "Read the latest tips, trends, and news about Pakistani wedding invitations on the ShaadiLink blog.",
    images: ["/og-image.png"],
  }
};

export default function BlogListingPage() {
  const posts = getAllPosts();

  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": "https://shaadilink.com.pk/blog",
    "name": "ShaadiLink Blog",
    "description": "Tips, trends, and inspiration for your perfect digital wedding invitation.",
    "url": "https://shaadilink.com.pk/blog",
    "publisher": {
      "@type": "Organization",
      "name": "ShaadiLink",
      "logo": {
        "@type": "ImageObject",
        "url": "https://shaadilink.com.pk/logo.svg"
      }
    },
    "blogPost": posts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.description,
      "datePublished": new Date(post.date).toISOString(),
      "url": `https://shaadilink.com.pk/blog/${post.slug}`,
      "author": {
        "@type": "Organization",
        "name": "ShaadiLink"
      }
    }))
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-display text-gold">The ShaadiLink Blog</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Tips, trends, and inspiration for your perfect digital wedding invitation.
          </p>
        </div>

        <div className="grid gap-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <div className="p-6 md:p-8 rounded-2xl border border-gold/20 bg-card hover:bg-gold/5 transition-colors group">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>
                <h2 className="text-2xl font-semibold mb-3 group-hover:text-gold transition-colors">
                  {post.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {post.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
