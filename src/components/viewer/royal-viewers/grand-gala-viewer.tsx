'use client'

import React from 'react'
import { SchoolViewerLayout } from '../layouts/school-viewer-layout'
import { getTheme } from '../utils'
import type { FlowData } from '@/lib/flow-types'

interface RoyalViewerProps {
  templateId?: string
  flowData?: FlowData
  guestName?: string | null
  guestSlug?: string | null
  isReviewMode?: boolean
}

export default function GrandGalaViewer(props: RoyalViewerProps) {
  const theme = getTheme('grand-gala')
  return (
    <SchoolViewerLayout
      templateId="grand-gala"
      flowData={props.flowData}
      guestName={props.guestName}
      guestSlug={props.guestSlug}
      customTheme={theme}
      isReviewMode={props.isReviewMode}
    />
  )
}
