"use client"

import { useState, useRef, useEffect } from 'react'
import { Download, Image as ImageIcon, FileText, Loader2, X, Crown } from 'lucide-react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from '@/components/ui/drawer'
import { toast } from 'sonner'
import { PrintableCard, CardTemplateTheme } from '@/components/templates/card-templates'
import type { FlowData } from '@/lib/flow-types'

interface PrintCardsDrawerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  flowData: FlowData
  plan?: string
}

export function PrintCardsDrawer({ isOpen, onOpenChange, flowData, plan }: PrintCardsDrawerProps) {
  const [selectedTheme, setSelectedTheme] = useState<CardTemplateTheme>('classic-gold')
  const [isExportingImage, setIsExportingImage] = useState(false)
  const [isExportingPDF, setIsExportingPDF] = useState(false)

  const [selectedEventNames, setSelectedEventNames] = useState<string[]>(() => {
    return flowData.events ? flowData.events.map(e => e.name) : []
  })

  useEffect(() => {
    if (flowData.events && flowData.events.length > 0) {
      setSelectedEventNames(flowData.events.map(e => e.name))
    }
  }, [flowData.events])

  const handleToggleEvent = (eventName: string) => {
    setSelectedEventNames(prev => 
      prev.includes(eventName) 
        ? prev.filter(name => name !== eventName) 
        : [...prev, eventName]
    )
  }

  const selectedEvents = (flowData.events || []).filter(e => selectedEventNames.includes(e.name))

  const captureCard = async (): Promise<HTMLCanvasElement | null> => {
    const node = document.getElementById('printable-card-node')
    if (!node) return null
    
    return await html2canvas(node, {
      scale: 2, // High resolution
      useCORS: true,
      logging: false,
      backgroundColor: null,
      onclone: (clonedDoc) => {
        // 1. Process all style sheets in clonedDoc to purge oklch definitions
        try {
          const styleSheets = Array.from(clonedDoc.styleSheets);
          styleSheets.forEach((sheet) => {
            try {
              const rules = Array.from(sheet.cssRules || []);
              let hasOklch = false;
              let cssText = '';
              
              rules.forEach((rule) => {
                const ruleText = rule.cssText;
                if (ruleText.includes('oklch')) {
                  hasOklch = true;
                  cssText += ruleText.replace(/oklch\([^)]+\)/g, '#000000') + '\n';
                } else {
                  cssText += ruleText + '\n';
                }
              });

              if (hasOklch) {
                const newStyle = clonedDoc.createElement('style');
                newStyle.textContent = cssText;
                clonedDoc.head.appendChild(newStyle);
                if (sheet.ownerNode && sheet.ownerNode.parentNode) {
                  sheet.ownerNode.parentNode.removeChild(sheet.ownerNode);
                }
              }
            } catch (e) {
              // Ignore cross-origin sheet errors
            }
          });
        } catch (e) {
          // Ignore stylesheet parsing errors
        }

        // 2. Also replace raw text in any remaining <style> elements
        const styleTags = Array.from(clonedDoc.querySelectorAll('style'));
        styleTags.forEach((style) => {
          if (style.textContent && style.textContent.includes('oklch')) {
            const cleaned = style.textContent.replace(/oklch\([^)]+\)/g, '#000000');
            const newStyle = clonedDoc.createElement('style');
            newStyle.textContent = cleaned;
            if (style.parentNode) {
              style.parentNode.replaceChild(newStyle, style);
            }
          }
        });

        // 3. Inspect inline styles on all elements inside clonedDoc
        const elements = Array.from(clonedDoc.querySelectorAll('*'));
        elements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          if (htmlEl.style && htmlEl.style.cssText && htmlEl.style.cssText.includes('oklch')) {
            htmlEl.style.cssText = htmlEl.style.cssText.replace(/oklch\([^)]+\)/g, '#000000');
          }
        });
      }
    })
  }

  const handleDownloadImage = async () => {
    setIsExportingImage(true)
    try {
      const canvas = await captureCard()
      if (!canvas) throw new Error("Could not capture card")
      
      const link = document.createElement('a')
      link.download = `${flowData.partner1Name}-${flowData.partner2Name}-Invitation.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      toast.success("Image downloaded successfully!")
    } catch (err) {
      toast.error("Failed to generate image")
      console.error(err)
    } finally {
      setIsExportingImage(false)
    }
  }

  const handleDownloadPDF = async () => {
    setIsExportingPDF(true)
    try {
      const canvas = await captureCard()
      if (!canvas) throw new Error("Could not capture card")
      
      const imgData = canvas.toDataURL('image/png')
      
      // A4 format is 210 x 297 mm
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      // The card is designed at 595x842 px (A4 proportion)
      // So we can fill the A4 pdf
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`${flowData.partner1Name}-${flowData.partner2Name}-Invitation.pdf`)
      
      toast.success("PDF downloaded successfully!")
    } catch (err) {
      toast.error("Failed to generate PDF")
      console.error(err)
    } finally {
      setIsExportingPDF(false)
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[95vh]">
        <DrawerHeader className="border-b">
          <DrawerTitle className="text-2xl font-display flex items-center justify-between">
            Printable Cards
            <DrawerClose asChild>
              <Button variant="ghost" size="icon"><X className="w-5 h-5"/></Button>
            </DrawerClose>
          </DrawerTitle>
          <DrawerDescription>
            Select a template and export your invitation for physical printing.
          </DrawerDescription>
        </DrawerHeader>

        <div className="p-4 sm:p-6 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 100px)' }}>
          <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
            
            {/* Left Column: Settings & Export */}
            <div className="w-full lg:w-1/3 flex flex-col gap-6">
              <Card>
                <CardContent className="p-5 flex flex-col gap-4">
                  <h3 className="font-semibold text-lg">1. Choose Template</h3>
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant={selectedTheme === 'classic-gold' ? 'default' : 'outline'}
                      onClick={() => setSelectedTheme('classic-gold')}
                      className="justify-start"
                    >
                      Classic Gold
                    </Button>
                    <Button 
                      variant={selectedTheme === 'emerald-royal' ? 'default' : 'outline'}
                      onClick={() => setSelectedTheme('emerald-royal')}
                      className="justify-start"
                    >
                      Emerald Royal
                    </Button>
                    <Button 
                      variant={selectedTheme === 'minimalist-floral' ? 'default' : 'outline'}
                      onClick={() => setSelectedTheme('minimalist-floral')}
                      className="justify-start"
                    >
                      Minimalist Floral
                    </Button>
                    <Button 
                      variant={selectedTheme === 'minimalist-modern' ? 'default' : 'outline'}
                      onClick={() => setSelectedTheme('minimalist-modern')}
                      className="justify-start flex justify-between items-center"
                    >
                      <span>Minimalist Modern</span>
                      {plan !== 'royal' && <Crown className="w-4 h-4 text-gold" />}
                    </Button>
                    <Button 
                      variant={selectedTheme === 'luxurious-botanical' ? 'default' : 'outline'}
                      onClick={() => setSelectedTheme('luxurious-botanical')}
                      className="justify-start flex justify-between items-center"
                    >
                      <span>Luxurious Botanical</span>
                      {plan !== 'royal' && <Crown className="w-4 h-4 text-gold" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {flowData.events && flowData.events.length > 0 && (
                <Card>
                  <CardContent className="p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">2. Select Events</h3>
                      <button 
                        type="button"
                        onClick={() => {
                          if (selectedEventNames.length === flowData.events.length) {
                            setSelectedEventNames([])
                          } else {
                            setSelectedEventNames(flowData.events.map(e => e.name))
                          }
                        }}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                      >
                        {selectedEventNames.length === flowData.events.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Choose which events to display on the card.
                    </p>

                    <div className="flex flex-col gap-2 mt-1">
                      {flowData.events.map((event, idx) => {
                        const isChecked = selectedEventNames.includes(event.name)
                        return (
                          <label
                            key={idx}
                            className={`flex items-start gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                              isChecked ? 'border-emerald/50 bg-emerald/10' : 'border-border/40 bg-background/50 hover:bg-muted/30'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleEvent(event.name)}
                              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-emerald focus:ring-emerald accent-emerald cursor-pointer"
                            />
                            <div className="flex flex-col gap-0.5 text-left">
                              <span className="font-semibold text-foreground">{event.name}</span>
                              <span className="text-[11px] text-muted-foreground">
                                {event.date} {event.time ? `· ${event.time}` : ''}
                              </span>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="p-5 flex flex-col gap-4">
                  <h3 className="font-semibold text-lg">{flowData.events && flowData.events.length > 0 ? '3. Export Options' : '2. Export Options'}</h3>
                  
                  {((selectedTheme === 'minimalist-modern' || selectedTheme === 'luxurious-botanical') && plan !== 'royal') ? (
                    <div className="bg-gold/10 border border-gold/30 rounded-lg p-3 text-sm text-center">
                      <Crown className="w-5 h-5 text-gold mx-auto mb-2" />
                      <p className="font-semibold text-gold mb-1">Premium Template</p>
                      <p className="text-muted-foreground text-xs">Upgrade to the Royal plan to download this template.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Button 
                        onClick={handleDownloadImage}
                        disabled={isExportingImage || isExportingPDF}
                      className="w-full gap-2 bg-emerald hover:bg-emerald-dark"
                    >
                      {isExportingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                      Download as Image (PNG)
                    </Button>
                    
                    <Button 
                      onClick={handleDownloadPDF}
                      disabled={isExportingImage || isExportingPDF}
                      className="w-full gap-2 bg-slate-800 hover:bg-slate-900 text-white"
                    >
                      {isExportingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                      Download as PDF (Print Ready)
                    </Button>
                  </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Note: PDF generation uses standard A4 dimensions for easy printing at any local shop.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Preview */}
            <div className="w-full lg:w-2/3 flex flex-col items-center">
              <h3 className="font-semibold text-lg mb-4 self-start lg:self-center">Live Preview</h3>
              
              <div className="w-full overflow-auto bg-slate-100 p-8 rounded-xl border flex items-center justify-center min-h-[500px]">
                {/* Scale the preview down for smaller screens, but keep the actual DOM node full size for html2canvas */}
                <div 
                  className="transform scale-50 sm:scale-75 md:scale-90 lg:scale-[0.8] xl:scale-100 origin-top"
                  style={{ width: '595px', height: '842px' }}
                >
                  <PrintableCard flowData={flowData} theme={selectedTheme} selectedEvents={selectedEvents} />
                </div>
              </div>

            </div>

          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
