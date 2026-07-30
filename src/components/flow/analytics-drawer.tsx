"use client";

import { useEffect, useState } from "react";
import { Loader2, PieChart as PieChartIcon, Activity } from "lucide-react";
import { X } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface AnalyticsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  invitationId: string | null;
  acceptedRsvps: number;
  declinedRsvps: number;
}

export function AnalyticsDrawer({
  isOpen,
  onClose,
  invitationId,
  acceptedRsvps,
  declinedRsvps,
}: AnalyticsDrawerProps) {
  const [chartData, setChartData] = useState<{ date: string; views: number }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && invitationId) {
      setLoading(true);
      fetch(`/api/invitations/${invitationId}/analytics`)
        .then((res) => res.json())
        .then((data) => {
          if (data.chartData) {
            setChartData(data.chartData);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, invitationId]);

  if (!isOpen) return null;

  const rsvpData = [
    { name: "Accepted", value: acceptedRsvps, color: "#10b981" }, // emerald
    { name: "Declined", value: declinedRsvps, color: "#ef4444" }, // red
  ];
  const hasRsvps = acceptedRsvps > 0 || declinedRsvps > 0;

  return (
    <>
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 transition-opacity" 
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-card border-l border-border shadow-2xl z-50 flex flex-col h-full overflow-hidden transition-transform">
        <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between bg-card/50 backdrop-blur-md shrink-0">
          <div>
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              Analytics
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Views and RSVPs over time
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8">
          {/* Views Line Chart */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              Invitation Views (Last 30 Days)
            </h3>
            <div className="h-[250px] bg-muted/20 border border-border rounded-xl p-4">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12, fill: 'currentColor' }}
                      tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      className="opacity-60"
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: 'currentColor' }}
                      className="opacity-60"
                      allowDecimals={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--tw-colors-card)', borderColor: 'var(--tw-colors-border)', borderRadius: '8px' }}
                      itemStyle={{ color: 'var(--tw-colors-foreground)' }}
                    />
                    <Line type="monotone" dataKey="views" stroke="#818cf8" strokeWidth={3} dot={{ r: 4, fill: '#818cf8' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm text-center">
                  No views yet. Share your link to start tracking!
                </div>
              )}
            </div>
          </div>

          {/* RSVPs Pie Chart */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-emerald" />
              RSVP Distribution
            </h3>
            <div className="h-[250px] bg-muted/20 border border-border rounded-xl p-4 flex flex-col sm:flex-row items-center justify-center gap-6">
              {!hasRsvps ? (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                  No RSVPs received yet.
                </div>
              ) : (
                <>
                  <div className="w-[150px] h-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={rsvpData}
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {rsvpData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'var(--tw-colors-card)', borderColor: 'var(--tw-colors-border)', borderRadius: '8px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-3">
                    {rsvpData.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-sm font-medium">{entry.name}:</span>
                        <span className="text-sm font-bold">{entry.value}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 pt-2 border-t border-border mt-1">
                      <span className="text-sm text-muted-foreground">Total:</span>
                      <span className="text-sm font-bold">{acceptedRsvps + declinedRsvps}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
