"use client";

import InvitationViewer from "@/components/viewer/invitation-viewer";
import type { FlowData } from "@/lib/flow-types";

interface Props {
  templateId: string;
  flowData: FlowData;
  guestName?: string | null;
  guestSlug?: string | null;
  isReviewMode?: boolean;
  viewsCount?: number;
  maxViews?: number;
}

export default function InvitationViewerWrapper({ templateId, flowData, guestName, guestSlug, isReviewMode, viewsCount, maxViews }: Props) {
  return (
    <div className={`min-h-screen ${isReviewMode ? "client-review-active" : ""}`}>
      <InvitationViewer
        templateId={templateId}
        flowData={flowData}
        guestName={guestName}
        guestSlug={guestSlug}
        isReviewMode={isReviewMode}
        viewsCount={viewsCount}
        maxViews={maxViews}
      />
    </div>
  );
}
