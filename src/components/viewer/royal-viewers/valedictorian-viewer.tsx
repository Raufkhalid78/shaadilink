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
}

export default function ValedictorianViewer(props: RoyalViewerProps) {
  const theme = getTheme('valedictorian-prestige')
  return (
    <SchoolViewerLayout
      templateId="valedictorian-prestige"
      flowData={props.flowData}
      guestName={props.guestName}
      guestSlug={props.guestSlug}
      customTheme={theme}
    />
  )
}
