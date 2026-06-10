"use client";

import InvitationViewer from "@/components/viewer/invitation-viewer";
import type { FlowData } from "@/lib/flow-types";

interface Props {
  templateId: string;
  flowData: FlowData;
}

export default function InvitationViewerWrapper({ templateId, flowData }: Props) {
  return (
    <div className="min-h-screen">
      <InvitationViewer templateId={templateId} flowData={flowData} />
    </div>
  );
}
