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
}

export default function VisionaryKeynoteViewer(props: RoyalViewerProps) {
  const theme = getTheme('visionary-keynote')
  return (
    <CorporateViewerLayout
      templateId="visionary-keynote"
      flowData={props.flowData}
      guestName={props.guestName}
      guestSlug={props.guestSlug}
      customTheme={theme}
    />
  )
}
