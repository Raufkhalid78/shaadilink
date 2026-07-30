"use client";

import InvitationViewer from "@/components/viewer/invitation-viewer";
import type { FlowData } from "@/lib/flow-types";

interface Props {
  templateId: string;
  flowData: FlowData;
  guestName?: string | null;
  guestSlug?: string | null;
}

export default function InvitationViewerWrapper({ templateId, flowData, guestName, guestSlug }: Props) {
  return (
    <div className="min-h-screen">
      <InvitationViewer templateId={templateId} flowData={flowData} guestName={guestName} guestSlug={guestSlug} />
    </div>
  );
}
