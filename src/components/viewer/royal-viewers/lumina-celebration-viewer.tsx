'use client'

import React from 'react'
import { BirthdayViewerLayout } from '../layouts/birthday-viewer-layout'
import { getTheme } from '../utils'
import type { FlowData } from '@/lib/flow-types'

interface RoyalViewerProps {
  templateId?: string
  flowData?: FlowData
  guestName?: string | null
  guestSlug?: string | null
}

export default function LuminaCelebrationViewer(props: RoyalViewerProps) {
  const theme = getTheme('lumina-celebration')
  return (
    <BirthdayViewerLayout
      templateId="lumina-celebration"
      flowData={props.flowData}
      guestName={props.guestName}
      guestSlug={props.guestSlug}
      customTheme={theme}
    />
  )
}
