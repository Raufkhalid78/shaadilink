import { Metadata } from "next";
import InvitationViewer from "@/components/viewer/invitation-viewer";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const templateName = id.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  
  return {
    title: `${templateName} — Demo | ShaadiLink`,
    description: `View the live demo of the ${templateName} wedding invitation template on ShaadiLink.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function DemoPage({ params }: Props) {
  const { id } = await params;
  
  return (
    <div className="min-h-screen">
      <InvitationViewer templateId={id} />
    </div>
  );
}
