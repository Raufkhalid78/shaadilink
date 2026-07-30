import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    
    // Validate ownership
    const { data: inv, error: invError } = await supabase
      .from('invitations')
      .select('id, user_id, view_count')
      .eq('id', id)
      .single()

    if (invError || !inv) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (inv.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get views over time for the chart (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: viewsData, error: viewsError } = await supabase
      .from('invitation_views')
      .select('viewed_at')
      .eq('invitation_id', id)
      .gte('viewed_at', thirtyDaysAgo.toISOString())

    if (viewsError) {
      console.error('Error fetching views:', viewsError)
    }

    // Process views into daily counts
    const viewsByDate: Record<string, number> = {}
    if (viewsData) {
      viewsData.forEach((row) => {
        const dateStr = new Date(row.viewed_at).toISOString().split('T')[0]
        viewsByDate[dateStr] = (viewsByDate[dateStr] || 0) + 1
      })
    }

    // Format for chart: array of { date, views }
    const chartData = Object.keys(viewsByDate)
      .sort()
      .map((date) => ({
        date,
        views: viewsByDate[date],
      }))

    // If there is only 1 data point, Recharts won't draw a line. 
    // Add a 0-view point for the day before so the line goes up from 0.
    if (chartData.length === 1) {
      const prevDate = new Date(chartData[0].date)
      prevDate.setDate(prevDate.getDate() - 1)
      chartData.unshift({
        date: prevDate.toISOString().split('T')[0],
        views: 0
      })
    }

    return NextResponse.json({ chartData })
  } catch (error) {
    console.error('GET /api/invitations/[id]/analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
