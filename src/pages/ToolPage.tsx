import { Copy, Check, Lock, Unlock } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ShareModal, isShareDismissed } from '@/components/ShareModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/pages/PageHeader'

function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a))
  b = Math.abs(Math.round(b))
  while (b) {
    const temp = b
    b = a % b
    a = temp
  }
  return a
}

function formatRatio(w: number, h: number): string {
  if (!w || !h || w <= 0 || h <= 0) return '-'
  const d = gcd(w, h)
  return `${w / d}:${h / d}`
}

interface Preset {
  labelKey: string
  rw: number
  rh: number
  defaultW: number
  defaultH: number
}

const PRESETS: Preset[] = [
  { labelKey: 'tool.preset16_9', rw: 16, rh: 9, defaultW: 1920, defaultH: 1080 },
  { labelKey: 'tool.preset4_3', rw: 4, rh: 3, defaultW: 1024, defaultH: 768 },
  { labelKey: 'tool.preset1_1', rw: 1, rh: 1, defaultW: 1080, defaultH: 1080 },
  { labelKey: 'tool.preset21_9', rw: 21, rh: 9, defaultW: 2560, defaultH: 1080 },
  { labelKey: 'tool.preset3_2', rw: 3, rh: 2, defaultW: 1440, defaultH: 960 },
  { labelKey: 'tool.preset9_16', rw: 9, rh: 16, defaultW: 1080, defaultH: 1920 },
  { labelKey: 'tool.preset2_3', rw: 2, rh: 3, defaultW: 800, defaultH: 1200 },
  { labelKey: 'tool.preset4_5', rw: 4, rh: 5, defaultW: 1080, defaultH: 1350 },
  { labelKey: 'tool.preset185_1', rw: 185, rh: 100, defaultW: 1998, defaultH: 1080 },
]

interface Resolution {
  w: number
  h: number
  label: string
}

const COMMON_RESOLUTIONS: Resolution[] = [
  { w: 3840, h: 2160, label: '4K UHD' },
  { w: 2560, h: 1440, label: 'QHD' },
  { w: 1920, h: 1080, label: 'Full HD' },
  { w: 1280, h: 720, label: 'HD' },
  { w: 1080, h: 1080, label: 'Square' },
  { w: 1080, h: 1920, label: 'Vertical HD' },
  { w: 1024, h: 768, label: 'XGA' },
  { w: 800, h: 600, label: 'SVGA' },
  { w: 2560, h: 1080, label: 'Ultrawide FHD' },
  { w: 1080, h: 1350, label: 'Instagram Portrait' },
]

export function ToolPage() {
  const { t } = useTranslation()
  const [width, setWidth] = useState<string>('1920')
  const [height, setHeight] = useState<string>('1080')
  const [locked, setLocked] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const hasCalculated = useRef(false)

  const lockedRatioRef = useRef<{ rw: number; rh: number } | null>(null)

  const w = Number(width) || 0
  const h = Number(height) || 0

  const ratio = useMemo(() => formatRatio(w, h), [w, h])

  useEffect(() => {
    if (locked && w > 0 && h > 0) {
      const d = gcd(w, h)
      lockedRatioRef.current = { rw: w / d, rh: h / d }
    }
  }, [locked, w, h])

  const handleWidthChange = useCallback(
    (val: string) => {
      setWidth(val)
      if (locked && lockedRatioRef.current) {
        const newW = Number(val) || 0
        if (newW > 0) {
          const newH = Math.round((newW * lockedRatioRef.current.rh) / lockedRatioRef.current.rw)
          setHeight(String(newH))
        }
      }
      if (!hasCalculated.current) {
        hasCalculated.current = true
        if (!isShareDismissed()) {
          setTimeout(() => setShowShare(true), 1500)
        }
      }
    },
    [locked]
  )

  const handleHeightChange = useCallback(
    (val: string) => {
      setHeight(val)
      if (locked && lockedRatioRef.current) {
        const newH = Number(val) || 0
        if (newH > 0) {
          const newW = Math.round((newH * lockedRatioRef.current.rw) / lockedRatioRef.current.rh)
          setWidth(String(newW))
        }
      }
      if (!hasCalculated.current) {
        hasCalculated.current = true
        if (!isShareDismissed()) {
          setTimeout(() => setShowShare(true), 1500)
        }
      }
    },
    [locked]
  )

  const handlePreset = useCallback((preset: Preset) => {
    setWidth(String(preset.defaultW))
    setHeight(String(preset.defaultH))
    lockedRatioRef.current = { rw: preset.rw, rh: preset.rh }
    if (!hasCalculated.current) {
      hasCalculated.current = true
      if (!isShareDismissed()) {
        setTimeout(() => setShowShare(true), 1500)
      }
    }
  }, [])

  const handleResolution = useCallback((res: Resolution) => {
    setWidth(String(res.w))
    setHeight(String(res.h))
    const d = gcd(res.w, res.h)
    lockedRatioRef.current = { rw: res.w / d, rh: res.h / d }
    if (!hasCalculated.current) {
      hasCalculated.current = true
      if (!isShareDismissed()) {
        setTimeout(() => setShowShare(true), 1500)
      }
    }
  }, [])

  const handleCopy = useCallback(async () => {
    if (ratio === '-') return
    try {
      await navigator.clipboard.writeText(ratio)
      setCopied(true)
      toast.success(t('tool.copiedToClipboard'))
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t('tool.copyFailed'))
    }
  }, [ratio, t])

  // Visual preview dimensions (max 280px box)
  const previewSize = useMemo(() => {
    if (w <= 0 || h <= 0) return { pw: 280, ph: 180 }
    const maxDim = 280
    const scale = Math.min(maxDim / w, maxDim / h)
    return { pw: Math.max(40, Math.round(w * scale)), ph: Math.max(40, Math.round(h * scale)) }
  }, [w, h])

  return (
    <div className="space-y-8">
      <PageHeader />

      <div className="mx-auto max-w-5xl px-4 space-y-8">
        {/* Main calculator */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Left: inputs */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="width">{t('tool.width')}</Label>
                    <Input
                      id="width"
                      type="number"
                      min="1"
                      dir="ltr"
                      value={width}
                      onChange={e => handleWidthChange(e.target.value)}
                      placeholder="1920"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">{t('tool.height')}</Label>
                    <Input
                      id="height"
                      type="number"
                      min="1"
                      dir="ltr"
                      value={height}
                      onChange={e => handleHeightChange(e.target.value)}
                      placeholder="1080"
                    />
                  </div>
                </div>

                {/* Ratio display */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 rounded-lg border bg-muted/50 px-4 py-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">{t('tool.ratio')}</p>
                    <p className="text-3xl font-bold text-foreground" dir="ltr">{ratio}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopy}
                      title={copied ? t('tool.copied') : t('tool.copy')}
                      disabled={ratio === '-'}
                    >
                      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                    </Button>
                    <Button
                      variant={locked ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setLocked(!locked)}
                      title={t('tool.lockRatio')}
                    >
                      {locked ? <Lock className="size-4" /> : <Unlock className="size-4" />}
                    </Button>
                  </div>
                </div>

                {locked && (
                  <p className="text-xs text-muted-foreground text-center">
                    {t('tool.lockRatio')}: {ratio}
                  </p>
                )}
              </div>

              {/* Right: visual preview */}
              <div className="flex flex-col items-center justify-center space-y-3">
                <p className="text-sm font-medium text-muted-foreground">{t('tool.visualPreview')}</p>
                <div className="flex items-center justify-center rounded-lg border border-dashed p-4" style={{ minHeight: 200, minWidth: 200 }}>
                  <div
                    className="rounded-md bg-gradient-to-br from-orange-400 to-amber-500 shadow-md transition-all duration-300"
                    style={{ width: previewSize.pw, height: previewSize.ph }}
                  />
                </div>
                <p className="text-xs text-muted-foreground" dir="ltr">
                  {w > 0 && h > 0 ? `${w} x ${h}` : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Presets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('tool.presets')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('tool.clickToApply')}</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {PRESETS.map(preset => {
                const presetRatio = `${preset.rw}:${preset.rh}`
                const isActive = ratio === presetRatio
                return (
                  <button
                    key={preset.labelKey}
                    type="button"
                    onClick={() => handlePreset(preset)}
                    className={`rounded-lg border px-3 py-3 text-center transition-colors hover:bg-accent/50 ${
                      isActive ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30' : ''
                    }`}
                  >
                    <p className="font-bold text-sm text-foreground" dir="ltr">{presetRatio}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t(preset.labelKey)}</p>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Common resolutions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('tool.commonResolutions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t('tool.resolution')}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground" dir="ltr">{t('tool.width')}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground" dir="ltr">{t('tool.height')}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground" dir="ltr">{t('tool.ratio')}</th>
                  </tr>
                </thead>
                <tbody>
                  {COMMON_RESOLUTIONS.map(res => (
                    <tr
                      key={`${res.w}x${res.h}`}
                      className="border-b last:border-0 cursor-pointer transition-colors hover:bg-accent/30"
                      onClick={() => handleResolution(res)}
                    >
                      <td className="py-2.5 font-medium">{res.label}</td>
                      <td className="py-2.5" dir="ltr">{res.w}</td>
                      <td className="py-2.5" dir="ltr">{res.h}</td>
                      <td className="py-2.5" dir="ltr">{formatRatio(res.w, res.h)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <ShareModal open={showShare} onOpenChange={setShowShare} showDismissOption />
    </div>
  )
}
