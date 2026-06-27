import { getPostBySlug, getPostSlugs } from "@/lib/markdown";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map((slug) => ({
    slug: slug.replace(/\.md$/, ""),
  }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  try {
    const post = getPostBySlug(resolvedParams.slug);
    return {
      title: `${post.title} | ShaadiLink Blog`,
      description: post.description,
      openGraph: {
        title: post.title,
        description: post.description,
        type: "article",
        publishedTime: post.date,
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.description,
      },
    };
  } catch {
    return {
      title: "Blog | ShaadiLink",
    };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const resolvedParams = await params;
  let post;
  try {
    post = getPostBySlug(resolvedParams.slug);
  } catch {
    notFound();
  }

  return (
    <article className="min-h-screen bg-background pt-24 pb-12 px-6">
      <div className="max-w-3xl mx-auto space-y-10">
        <div className="space-y-6">
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Button>
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold font-display text-gold leading-tight">
            {post.title}
          </h1>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </div>
        </div>

        <div className="prose prose-invert prose-gold max-w-none prose-headings:font-display prose-headings:text-gold prose-a:text-gold hover:prose-a:text-gold/80 prose-img:rounded-xl prose-hr:border-gold/20">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>

        <div className="mt-16 pt-8 border-t border-gold/20 text-center space-y-6 bg-card p-8 rounded-2xl">
          <h3 className="text-2xl font-display text-gold">Ready to create your own digital invitation?</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Choose from our stunning collection of templates and personalize it for your big day.
          </p>
          <Link href="/templates">
            <Button size="lg" className="bg-gold text-background hover:bg-gold/90 text-lg px-8 py-6 h-auto mt-4">
              Explore Templates
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
