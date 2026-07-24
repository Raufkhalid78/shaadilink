import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    // Basic security check: if CRON_SECRET is set, ensure it matches
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = createServiceClient()

    // 1. Fetch all invitations with their events
    const { data: invitations, error: invError } = await service
      .from('invitations')
      .select('id, created_at, hero_image_url, slideshow_image_urls, events(date)')

    if (invError || !invitations) {
      console.error('Failed to fetch invitations:', invError)
      return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 })
    }

    const now = new Date()
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(now.getMonth() - 3)

    let deletedCount = 0

    for (const inv of invitations) {
      let latestDateStr = inv.created_at

      // Find the latest valid event date
      const validEvents = inv.events?.filter(e => e.date && !isNaN(new Date(e.date).getTime())) || []
      if (validEvents.length > 0) {
        validEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        latestDateStr = validEvents[0].date
      }

      const latestDate = new Date(latestDateStr)

      // If the latest event date (or creation date) is older than 3 months
      if (latestDate < threeMonthsAgo) {
        console.log(`Deleting expired invitation ${inv.id} (latest date: ${latestDateStr})`)
        
        // 2. Extract image paths to delete from Supabase Storage
        const filesToDelete: string[] = []
        
        if (inv.hero_image_url) {
          const match = inv.hero_image_url.match(/invitation-images\/(.+)$/)
          if (match) filesToDelete.push(match[1])
        }
        
        for (const url of inv.slideshow_image_urls || []) {
          const match = url.match(/invitation-images\/(.+)$/)
          if (match) filesToDelete.push(match[1])
        }

        // 3. Delete files from Storage
        if (filesToDelete.length > 0) {
          const { error: storageError } = await service.storage
            .from('invitation-images')
            .remove(filesToDelete)
            
          if (storageError) {
            console.error(`Failed to delete images for ${inv.id}:`, storageError)
          }
        }

        // 4. Delete the invitation from the database
        // (Due to ON DELETE CASCADE, events, rsvps, and wishes are also deleted)
        const { error: dbError } = await service
          .from('invitations')
          .delete()
          .eq('id', inv.id)

        if (dbError) {
          console.error(`Failed to delete invitation record ${inv.id}:`, dbError)
        } else {
          deletedCount++
        }
      }
    }

    return NextResponse.json({ success: true, deletedCount })
  } catch (error) {
    console.error('Cron cleanup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
