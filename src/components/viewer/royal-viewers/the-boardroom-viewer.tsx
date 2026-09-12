'use client'

import React from 'react'
import { CorporateViewerLayout } from '../layouts/corporate-viewer-layout'
import { getTheme } from '../utils'
import type { FlowData } from '@/lib/flow-types'

interface RoyalViewerProps {
  templateId?: string
  flowData?: FlowData
  guestName?: string | null
  guestSlug?: string | null
  isReviewMode?: boolean
}

export default function TheBoardroomViewer(props: RoyalViewerProps) {
  const theme = getTheme('the-boardroom')
  return (
    <CorporateViewerLayout
      templateId="the-boardroom"
      flowData={props.flowData}
      guestName={props.guestName}
      guestSlug={props.guestSlug}
      customTheme={theme}
      isReviewMode={props.isReviewMode}
    />
  )
}
