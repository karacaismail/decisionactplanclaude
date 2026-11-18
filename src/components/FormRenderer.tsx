import { useEffect, useRef, useState, type AnimationEvent } from 'react'
import { Button, Card, Form, Segmented, Tag } from 'antd'
import { CaretDown, CaretUp } from '@phosphor-icons/react'
import type { Field, Section, StepDef } from '@/data/schema'
import type { PlanDoc } from '@/data/types'
import { evalCondition } from '@/engine/conditions'
import { FieldControl, isFilled } from './FieldControl'
import { CalcField } from './CalcField'

export interface SectionStat {
  /** Kart kimliği. Sağ sütundaki bağlantı listesi (Anchor) buraya atlar. */
  id: string
  title: string
  total: number
  filled: number
  /** İsteğe bağlı bölüm. Boşken kapalı gelir. */
  optional: boolean
}

/** Bölüm başlığı yoksa kartın adı budur. */
const FALLBACK_TITLE = 'Sorular'
/** Bu sayıda isteğe bağlı bölüm olunca form iki sekmeye ayrılır. */
export const TAB_THRESHOLD = 3

type Tab = 'zorunlu' | 'istege'

/** Uzun metinde kutunun tamamı yerine yazılan satırı görünür tutar. */
function textareaCaretBounds(field: HTMLTextAreaElement): { top: number; bottom: number } {
  const rect = field.getBoundingClientRect()
  const style = window.getComputedStyle(field)
  const mirror = document.createElement('div')
  const marker = document.createElement('span')
  /* Ölçüm kopyası görünmez. Yazı ve satır sarımı gerçek alanla aynıdır. */
  for (const property of ['font', 'letter-spacing', 'word-spacing', 'line-height', 'text-transform', 'text-indent', 'text-align', 'direction', 'tab-size', 'padding', 'word-break', 'overflow-wrap']) {
    mirror.style.setProperty(property, style.getPropertyValue(property))
  }
  Object.assign(mirror.style, {
    position: 'fixed', top: '0', left: '0', visibility: 'hidden', pointerEvents: 'none',
    boxSizing: 'border-box', width: `${field.clientWidth}px`, height: '0', overflow: 'hidden',
    whiteSpace: field.wrap === 'off' ? 'pre' : 'pre-wrap',
  })
  mirror.setAttribute('aria-hidden', 'true')
  const caret = field.selectionDirection === 'backward' ? field.selectionStart : field.selectionEnd
  mirror.textContent = field.value.slice(0, caret)
  marker.textContent = field.value.slice(caret) || '\u200b'
  mirror.append(marker)
  document.body.append(mirror)
  try {
    const line = marker.getClientRects()[0]
    if (!line) return rect
    const lineHeight = Number.parseFloat(style.lineHeight) || line.height
    const lineTop = line.top - mirror.getBoundingClientRect().top - Math.max(0, (lineHeight - line.height) / 2)
    /* Tarayıcı henüz iç kaydırmayı yapmadıysa imleci alanın içine getirir. */
    if (lineTop < field.scrollTop) field.scrollTop = lineTop
    else if (lineTop + lineHeight > field.scrollTop + field.clientHeight) {
      field.scrollTop = lineTop + lineHeight - field.clientHeight
    }
    const top = rect.top + field.clientTop + lineTop - field.scrollTop
    return { top, bottom: top + lineHeight }
  } finally {
    mirror.remove()
  }
}

/** Bölüm bu planda görünür mü? Kısa yol bazı bölümleri gizler. */
export function sectionVisible(sec: Section, plan: PlanDoc, stepId: string, values: Record<string, unknown>): boolean {
  if (plan.shortPath && sec.hideInShortPath) return false
  return evalCondition(sec.when, plan, stepId, values)
}

function visibleFields(sec: Section, plan: PlanDoc, values: Record<string, unknown>): Field[] {
  return sec.fields.filter((f) => f.type !== 'info' && f.type !== 'calc' && evalCondition(f.when, plan, undefined, values))
}

/** Görünen bölümler ve her birinin doluluk sayısı. Sağ sütun ve kart başlıkları bu sayıları kullanır. */
export function sectionStats(step: StepDef, plan: PlanDoc, values: Record<string, unknown>): SectionStat[] {
  const out: SectionStat[] = []
  step.sections.forEach((sec, i) => {
    if (!sectionVisible(sec, plan, step.id, values)) return
    const fields = visibleFields(sec, plan, values)
    out.push({ id: `b${step.id}-${i}`, title: sec.title ?? FALLBACK_TITLE, total: fields.length, filled: fields.filter((f) => isFilled(values[f.key])).length, optional: Boolean(sec.optional) })
  })
  return out
}

/**
 * Adımın tamam sayılması için dolu olması gereken alanlar.
 * Gizli bir bölümdeki alan istenmez. Örneğin kısa yolda gizlenen bölümün alanı.
 */
export function requiredKeys(step: StepDef, plan: PlanDoc, values: Record<string, unknown>): string[] {
  const visible = new Set(step.sections.filter((sec) => sectionVisible(sec, plan, step.id, values)).flatMap((sec) => visibleFields(sec, plan, values).map((f) => f.key)))
  return (step.completeWhen ?? []).filter((k) => visible.has(k))
}

/**
 * Adım tanımını form kartlarına çevirir. Her bölüm bir `Card` olur: başlık solda, doluluk etiketi sağda.
 * Koşullu bölüm ve alanları gizler. Alanlar 24 sütunlu ızgarada `span` ile yan yana gelir.
 * İsteğe bağlı bölüm boşken kapalı gelir. Kullanıcı düğmeyle açar. Dolu bölüm açık gelir.
 * Açık durumu ilk çizimde bir kez hesaplanır. Sonra bölümü yalnız kullanıcı kapatır. Alan boşalınca bölüm kapanmaz.
 * İsteğe bağlı bölüm sayısı çoksa form iki sekmeye ayrılır: zorunlu bölümler ve isteğe bağlı bölümler.
 * `revealId` verilirse o bölümün sekmesi seçilir, bölüm açılır ve ekrana getirilir.
 * Bileşen her adımda yeniden kurulur. Sekme ve açık durumu öteki adıma taşınmaz.
 */
export function FormRenderer({ step, plan, values, onChange, readOnly = false, revealId }: { step: StepDef; plan: PlanDoc; values: Record<string, unknown>; onChange: (key: string, v: unknown) => void; readOnly?: boolean; revealId?: { id: string; n: number } }) {
  const sectionElements = useRef(new Map<string, HTMLDivElement>())
  const stats = sectionStats(step, plan, values)
  const optionalCount = stats.filter((s) => s.optional).length
  const requiredCount = stats.length - optionalCount
  const tabbed = !readOnly && optionalCount >= TAB_THRESHOLD && requiredCount > 0
  const [tab, setTab] = useState<Tab>('zorunlu')
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() => Object.fromEntries(stats.filter((s) => s.optional).map((s) => [s.id, s.filled > 0])))
  /* Açılan ya da kapanan bölüm. Hareket bitince kayıt silinir. Kapanan bölümün gövdesi hareket bitene kadar durur. */
  const [moving, setMoving] = useState<Record<string, 'ac' | 'kapat'>>({})

  useEffect(() => {
    if (readOnly) return
    const viewport = window.visualViewport
    let frame: number | undefined
    let observedField: HTMLInputElement | HTMLTextAreaElement | null = null
    let resizeObserver: ResizeObserver | undefined
    const insetProperty = '--form-viewport-bottom-inset'
    const heightProperty = '--form-viewport-height'
    const positionProperty = '--form-action-position'
    const properties = [insetProperty, heightProperty, positionProperty]
    let viewportPage: HTMLElement | null = null
    const previousStyles = new Map<string, { value: string; priority: string }>()
    const restoreStyle = (property: string) => {
      const previous = previousStyles.get(property)
      if (previous?.value) viewportPage?.style.setProperty(property, previous.value, previous.priority)
      else viewportPage?.style.removeProperty(property)
    }
    const clearViewportStyles = () => {
      properties.forEach(restoreStyle)
      previousStyles.clear()
      viewportPage = null
    }
    const activeField = () => {
      const field = document.activeElement
      if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return null
      return [...sectionElements.current.values()].some((section) => section.contains(field)) ? field : null
    }
    const keepVisible = () => {
      frame = undefined
      const field = activeField()
      if (field !== observedField) {
        resizeObserver?.disconnect()
        observedField = field
        if (field) resizeObserver?.observe(field)
      }
      /* Panel ve düğme odağında görünen ekran ölçüleri korunur. */
      const page = field?.closest<HTMLElement>('.work-page') ?? (viewportPage?.contains(document.activeElement) ? viewportPage : null)
      if (!field && !page) {
        clearViewportStyles()
        return
      }
      const viewportTop = viewport?.offsetTop ?? 0
      const height = viewport?.height ?? window.innerHeight
      if (height <= 0) return
      if (page !== viewportPage) {
        clearViewportStyles()
        viewportPage = page
        for (const property of properties) {
          previousStyles.set(property, { value: page?.style.getPropertyValue(property) ?? '', priority: page?.style.getPropertyPriority(property) ?? '' })
        }
      }
      const inset = `${Math.ceil(Math.max(0, window.innerHeight - viewportTop - height))}px`
      if (page && page.style.getPropertyValue(insetProperty) !== inset) page.style.setProperty(insetProperty, inset)
      const visibleHeight = `${height}px`
      if (page && page.style.getPropertyValue(heightProperty) !== visibleHeight) page.style.setProperty(heightProperty, visibleHeight)
      restoreStyle(positionProperty)
      if (!field) return
      const control = field.closest('.ant-input-affix-wrapper, .ant-input-number, .ant-picker, .ant-select-selector') ?? field
      const controlRect = control.getBoundingClientRect()
      let top = viewportTop
      let bottom = viewportTop + height
      const overlappingBar = (element: HTMLElement | null | undefined) => {
        if (!element) return null
        const style = window.getComputedStyle(element)
        if (!['sticky', 'fixed'].includes(style.position) || style.display === 'none' || ['hidden', 'collapse'].includes(style.visibility) || style.opacity === '0') return null
        const bar = element.getBoundingClientRect()
        return bar.width > 0 && bar.height > 0 && bar.bottom > viewportTop && bar.top < viewportTop + height && bar.left < controlRect.right && bar.right > controlRect.left ? bar : null
      }
      for (const element of document.querySelectorAll<HTMLElement>('.topbar, .product-nav')) {
        const bar = overlappingBar(element)
        if (bar) top = Math.max(top, bar.bottom)
      }
      const actionElement = page?.querySelector<HTMLElement>('.step-actions')
      const actionBar = overlappingBar(actionElement)
      if (actionBar) bottom = Math.min(bottom, actionBar.top)
      let bounds: { top: number; bottom: number } = controlRect
      if (bounds.top >= top && bounds.bottom <= bottom) return
      if (field instanceof HTMLTextAreaElement) bounds = textareaCaretBounds(field)
      /* Şerit alana yer bırakmıyorsa sayfa akışına katılır. */
      if (page && actionBar && bottom - top < bounds.bottom - bounds.top) {
        page.style.setProperty(positionProperty, 'static')
        const remainingBar = overlappingBar(actionElement)
        bottom = remainingBar ? Math.min(viewportTop + height, remainingBar.top) : viewportTop + height
      }
      if (bottom <= top) return
      const delta = bounds.top < top ? bounds.top - top : Math.max(0, bounds.bottom - bottom)
      /* Odak düzeltmesi anlıktır. Hareket azaltma tercihinde de animasyon başlatmaz. */
      if (delta) window.scrollBy({ top: delta > 0 ? Math.ceil(delta) : Math.floor(delta), left: 0, behavior: 'instant' })
    }
    const schedule = () => {
      if (frame === undefined && (activeField() || viewportPage)) frame = window.requestAnimationFrame(keepVisible)
    }
    /* Metin kutusu büyürken imlecin satırı yeniden denetlenir. */
    if (typeof ResizeObserver !== 'undefined') resizeObserver = new ResizeObserver(schedule)
    document.addEventListener('focusin', schedule)
    document.addEventListener('focusout', schedule)
    document.addEventListener('input', schedule)
    document.addEventListener('selectionchange', schedule)
    window.addEventListener('resize', schedule)
    viewport?.addEventListener('resize', schedule)
    viewport?.addEventListener('scroll', schedule)
    schedule()
    return () => {
      if (frame !== undefined) window.cancelAnimationFrame(frame)
      resizeObserver?.disconnect()
      clearViewportStyles()
      document.removeEventListener('focusin', schedule)
      document.removeEventListener('focusout', schedule)
      document.removeEventListener('input', schedule)
      document.removeEventListener('selectionchange', schedule)
      window.removeEventListener('resize', schedule)
      viewport?.removeEventListener('resize', schedule)
      viewport?.removeEventListener('scroll', schedule)
    }
  }, [readOnly])

  /* Koşulla sonradan görünen bölüm de bir kez hesaplanır. */
  const unseen = stats.filter((s) => s.optional && openMap[s.id] === undefined).map((s) => s.id).join(',')
  useEffect(() => {
    if (!unseen) return
    setOpenMap((m) => {
      const next = { ...m }
      for (const s of stats) if (s.optional && next[s.id] === undefined) next[s.id] = s.filled > 0
      return next
    })
    /* Yalnız yeni bir bölüm göründüğünde çalışır. */
  }, [unseen])

  useEffect(() => {
    if (!revealId) return
    const target = stats.find((s) => s.id === revealId.id)
    if (!target) return
    if (target.optional) {
      setTab('istege')
      setOpenMap((m) => ({ ...m, [target.id]: true }))
    } else setTab('zorunlu')
    /* Kart önce çizilir, sonra ekrana gelir. Odak bölüm başlığına geçer. */
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let second = 0
    const first = window.requestAnimationFrame(() => {
      second = window.requestAnimationFrame(() => {
        const card = document.getElementById(target.id)
        card?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
        document.getElementById(`${target.id}-baslik`)?.focus({ preventScroll: true })
      })
    })
    return () => {
      window.cancelAnimationFrame(first)
      window.cancelAnimationFrame(second)
    }
    /* Yalnız yeni bir istek geldiğinde çalışır. */
  }, [revealId?.n])

  const isOpen = (s: SectionStat) => !s.optional || readOnly || (openMap[s.id] ?? s.filled > 0)
  const toggle = (s: SectionStat, open: boolean) => {
    setOpenMap((m) => ({ ...m, [s.id]: !open }))
    setMoving((m) => ({ ...m, [s.id]: open ? 'kapat' : 'ac' }))
  }
  const settle = (id: string) => (e: AnimationEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return
    setMoving((m) => {
      const next = { ...m }
      delete next[id]
      return next
    })
  }
  let k = 0
  return (
    <Form layout="vertical" component={false} requiredMark={false} className="step-form">
      {tabbed ? (
        <div className="form-tabs">
          <Segmented<Tab>
            block
            value={tab}
            onChange={setTab}
            aria-label="Bölüm türü"
            options={[
              { value: 'zorunlu', label: `Zorunlu bölümler (${requiredCount})` },
              { value: 'istege', label: `İsteğe bağlı bölümler (${optionalCount})` },
            ]}
          />
          <p className="helper form-tabs-note">
            {tab === 'zorunlu' ? 'Bu sekmedeki bölümleri doldurmanız yeter. Öteki sekme isteğe bağlıdır.' : 'Bu bölümleri doldurmak zorunda değilsiniz. Doldurursanız devir raporu güçlenir.'}
          </p>
        </div>
      ) : null}
      {step.sections.map((sec, i) => {
        if (!sectionVisible(sec, plan, step.id, values)) return null
        const stat = stats[k++]
        if (tabbed && (stat.optional ? 'istege' : 'zorunlu') !== tab) return null
        const headId = `${stat.id}-baslik`
        const bodyId = `${stat.id}-govde`
        const done = stat.total > 0 && stat.filled === stat.total
        const open = isOpen(stat)
        const move = moving[stat.id]
        /* Kapanan bölümün gövdesi hareket bitene kadar ekranda kalır. */
        const shown = open || move === 'kapat'
        const collapsible = stat.optional && !readOnly
        return (
          <Card
            key={i}
            ref={(element) => {
              if (element) sectionElements.current.set(stat.id, element)
              else sectionElements.current.delete(stat.id)
            }}
            id={stat.id}
            role="group"
            className={`step-card form-section${stat.optional ? ' is-optional' : ''}${shown ? '' : ' is-closed'}`}
            variant="borderless"
            title={<span id={headId} tabIndex={-1}>{stat.title}</span>}
            extra={
              <span className="form-section-extra">
                {stat.optional ? <Tag className="fill-tag">İsteğe bağlı</Tag> : null}
                {stat.total ? <Tag className="fill-tag" color={done ? 'success' : undefined}>{stat.filled} / {stat.total} alan</Tag> : null}
                {collapsible ? (
                  <Button
                    type="text"
                    size="small"
                    className="form-section-toggle"
                    icon={open ? <CaretUp size={16} aria-hidden /> : <CaretDown size={16} aria-hidden />}
                    aria-expanded={open}
                    aria-controls={bodyId}
                    aria-label={`${stat.title} bölümünü ${open ? 'kapat' : 'aç'}`}
                    onClick={() => toggle(stat, open)}
                  >
                    {open ? 'Kapat' : 'Aç'}
                  </Button>
                ) : null}
              </span>
            }
            aria-labelledby={headId}
            styles={shown ? undefined : { body: { display: 'none' } }}
          >
            <div id={bodyId} className={`form-section-body${move === 'ac' ? ' is-opening' : move === 'kapat' ? ' is-closing' : ''}`} onAnimationEnd={move ? settle(stat.id) : undefined}>
              {shown ? (
                <>
                  {sec.description ? <p className="card-desc">{sec.description}</p> : null}
                  <div className="field-grid">
                    {sec.fields.map((f) => {
                      if (!evalCondition(f.when, plan, undefined, values)) return null
                      if (f.type === 'calc') {
                        const result = f.compute(values, plan)
                        return (
                          <div key={f.key} className="field-cell">
                            <CalcField label={f.label} result={result} emptyText={f.emptyText} current={result?.apply ? values[result.apply.key] : undefined} onApply={(key, v) => onChange(key, v)} />
                          </div>
                        )
                      }
                      return (
                        <div key={f.key} className={`field-cell${f.span && f.span < 24 ? ` span-${f.span}` : ''}`}>
                          <FieldControl field={f} value={values[f.key]} onChange={(v) => onChange(f.key, v)} plan={plan} values={values} idPrefix={`a${step.id}`} />
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : null}
            </div>
          </Card>
        )
      })}
    </Form>
  )
}
