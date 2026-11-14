import { useLayoutEffect, useState } from 'react'
import { Button, Drawer, Grid, Layout, Menu, theme } from 'antd'
import { Link, Outlet, useLocation, useNavigate } from 'react-router'
import { List, Folders, SquaresFour, Paperclip, CheckSquare, FileText, ClockCounterClockwise, Moon, Sun, Compass, ChartBar, BookOpenText, Briefcase, Users, MapTrifold, Handshake, Wallet, Package, ArrowsClockwise, Signpost, CaretRight, DoorOpen, Strategy, Stack, Lightbulb } from '@phosphor-icons/react'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import { DECISIONS } from '@/data/decisions'
import { STEPS, groupLabel } from '@/data/registry'
import { STAGES } from '@/data/stages'
import { transitionPassed, lastTransition } from '@/engine/readiness'
import { decisionLocked, gatePassed } from '@/engine/gate'
import { SaveStatus } from '@/components/SaveStatus'
import { CommandPalette, CommandPaletteButton } from '@/components/CommandPalette'
import { cssVariables } from '@/theme/tokens'
import { resolveMode } from '@/theme/antdTheme'
import type { PlanDoc } from '@/data/types'

const ICONS: Record<string, typeof Briefcase> = { briefcase: Briefcase, users: Users, map: MapTrifold, handshake: Handshake, wallet: Wallet, package: Package, repeat: ArrowsClockwise, signpost: Signpost }

export function decisionIcon(name: string): typeof Briefcase {
  return ICONS[name] ?? Briefcase
}

/** Tokenları CSS değişkeni olarak köke yazar. global.css yalnız bunları okur. */
function useThemeVariables(pref: 'light' | 'dark' | 'system') {
  useLayoutEffect(() => {
    const root = document.documentElement
    for (const [k, v] of Object.entries(cssVariables(resolveMode(pref)))) root.style.setProperty(k, v)
  }, [pref])
}

const PAGE_NAMES: Record<string, string> = {
  '/': 'Planlar',
  '/baslangic': 'Giriş',
  '/ozet': 'Plan özeti',
  '/devralma': 'Devralma',
  '/kanitlar': 'Kanıtlar',
  '/isler': 'İşler',
  '/ciktilar': 'Çıktılar',
  '/gecmis': 'Geçmiş',
  '/gostergeler': 'Göstergeler',
  '/yontemler': 'Karar Kitabı',
  '/gecis': 'Geçiş kapısı',
  '/strateji': 'Strateji çalışması',
  '/temel': 'Temel taşları',
  '/varsayimlar': 'Varsayımlar',
}

/** Konum satırı: Plan › Karar 3 › Adım 11. Son parça kalın yazılır. */
type Crumb = { label: string; short: string; to?: string }
function crumbs(pathname: string, plan?: PlanDoc): Crumb[] {
  const out: Crumb[] = []
  if (plan && pathname !== '/') out.push({ label: plan.name, short: plan.name, to: '/ozet' })
  const m = pathname.match(/^\/karar\/(\d+)(?:\/(adim|kapi)(?:\/(\w+))?)?/)
  if (m) {
    const n = Number(m[1])
    out.push(n === 9 ? { label: groupLabel(9), short: 'Strateji', to: '/strateji' } : { label: groupLabel(n), short: `Karar ${n}`, to: `/karar/${n}` })
    if (m[2] === 'adim' && m[3]) out.push({ label: `Adım ${m[3]}. ${STEPS[m[3]]?.title ?? ''}`.trim(), short: `Adım ${m[3]}` })
    if (m[2] === 'kapi') out.push({ label: `Kapı ${n}`, short: `Kapı ${n}` })
    return out
  }
  if (PAGE_NAMES[pathname]) out.push({ label: PAGE_NAMES[pathname], short: PAGE_NAMES[pathname] })
  return out
}

export function AppShell() {
  const { token } = theme.useToken()
  const bp = Grid.useBreakpoint()
  const wide = bp.lg
  const loc = useLocation()
  const nav = useNavigate()
  const plan = useCurrentPlan()
  const themeMode = usePlanStore((s) => s.theme)
  const setTheme = usePlanStore((s) => s.setTheme)
  const [open, setOpen] = useState(false)
  useThemeVariables(themeMode)

  const link = (to: string, text: string) => (
    <Link to={to}>
      <span className="label">{text}</span>
    </Link>
  )
  const decisionItem = (n: number) => {
    const d = DECISIONS.find((x) => x.n === n)!
    const Icon = decisionIcon(d.icon)
    const passed = gatePassed(plan!, d.n)
    const locked = decisionLocked(plan!, d.n)
    const current = !passed && !locked
    const state = passed ? 'Geçti' : locked ? 'Kilitli' : 'Açık'
    return {
      key: `/karar/${d.n}`,
      icon: <Icon size={20} weight={passed ? 'fill' : 'regular'} />,
      label: (
        <Link to={`/karar/${d.n}`} aria-label={`${d.n}. ${d.title}, ${state}`}>
          <span className="label">{d.n}. {d.title}</span>
          <span className={`status-dot ${passed ? 'is-passed' : current ? 'is-current' : ''}`} aria-hidden />
        </Link>
      ),
    }
  }
  const stage = (key: string) => STAGES.find((x) => x.key === key)!
  const passedTransition = plan ? transitionPassed(plan) : false
  const foundationDone = plan ? stage('temel').decisions.every((n) => gatePassed(plan, n)) : false
  const transitionState = passedTransition ? 'Geçti' : foundationDone ? 'Açık' : 'Kilitli'
  const items = [
    { key: '/', icon: <Folders size={20} />, label: link('/', 'Planlar') },
    ...(plan
      ? [
          { key: '/baslangic', icon: <Compass size={20} />, label: link('/baslangic', 'Giriş') },
          { key: '/ozet', icon: <SquaresFour size={20} />, label: link('/ozet', 'Plan özeti') },
          { type: 'group' as const, label: 'Temel', children: stage('temel').decisions.map(decisionItem) },
          {
            type: 'group' as const,
            label: 'Geçiş',
            children: [
              {
                key: '/gecis',
                icon: <DoorOpen size={20} weight={passedTransition ? 'fill' : 'regular'} />,
                label: (
                  <Link to="/gecis" aria-label={`Geçiş kapısı, ${transitionState}${lastTransition(plan)?.stale ? ', inceleme bekliyor' : ''}`}>
                    <span className="label">Geçiş kapısı</span>
                    <span className={`status-dot ${passedTransition ? 'is-passed' : foundationDone ? 'is-current' : ''}`} aria-hidden />
                  </Link>
                ),
              },
              {
                key: '/strateji',
                icon: <Strategy size={20} />,
                label: (
                  <Link to="/strateji" aria-label={`Strateji çalışması, ${passedTransition ? 'Açık' : 'Kilitli'}`}>
                    <span className="label">Strateji çalışması</span>
                    <span className={`status-dot ${passedTransition ? 'is-current' : ''}`} aria-hidden />
                  </Link>
                ),
              },
            ],
          },
          { type: 'group' as const, label: 'Uygulama', children: stage('uygulama').decisions.map(decisionItem) },
          {
            type: 'group' as const,
            label: 'Araçlar',
            children: [
              { key: '/temel', icon: <Stack size={20} />, label: link('/temel', 'Temel taşları') },
              { key: '/varsayimlar', icon: <Lightbulb size={20} />, label: link('/varsayimlar', 'Varsayımlar') },
              { key: '/kanitlar', icon: <Paperclip size={20} />, label: link('/kanitlar', 'Kanıtlar') },
              { key: '/isler', icon: <CheckSquare size={20} />, label: link('/isler', 'İşler') },
              { key: '/gostergeler', icon: <ChartBar size={20} />, label: link('/gostergeler', 'Göstergeler') },
              { key: '/ciktilar', icon: <FileText size={20} />, label: link('/ciktilar', 'Çıktılar') },
              { key: '/gecmis', icon: <ClockCounterClockwise size={20} />, label: link('/gecmis', 'Geçmiş') },
            ],
          },
        ]
      : []),
    { key: '/yontemler', icon: <BookOpenText size={20} />, label: link('/yontemler', 'Karar Kitabı') },
  ]
  const selected = loc.pathname.startsWith('/karar/9') ? '/strateji' : loc.pathname.startsWith('/karar/') ? `/karar/${loc.pathname.split('/')[2]}` : loc.pathname
  const menu = <Menu className="shell-menu" mode="inline" items={items} selectedKeys={[selected]} onClick={() => setOpen(false)} />
  const nextTheme = themeMode === 'dark' ? 'light' : 'dark'
  const brand = (
    <div className="brand">
      <span className="brand-mark" aria-hidden>
        <Compass size={18} weight="fill" />
      </span>
      <div className="brand-text">
        <strong>Girişimci Aksiyon Planı</strong>
      </div>
    </div>
  )
  const fullTrail = crumbs(loc.pathname, plan)
  /* Dar ekranda yalnız son iki parça görünür; plan adı menüde zaten vardır. */
  /* Telefonda yalnız son parça tam yazılır; öncekiler menüden ve "Geri" ile ulaşılır. */
  const trail = bp.md ? fullTrail : fullTrail.slice(-1)

  return (
    <Layout style={{ minHeight: '100dvh', background: token.colorBgLayout }}>
      {wide ? (
        <Layout.Sider width={240} className="no-print shell-sider" style={{ position: 'sticky', top: 0, height: '100dvh', overflowY: 'auto' }}>
          {brand}
          {menu}
        </Layout.Sider>
      ) : null}
      <Layout style={{ minWidth: 0, background: token.colorBgLayout }}>
        <Layout.Header className="no-print shell-header">
          {!wide ? <Button type="text" aria-label="Menüyü aç" icon={<List size={20} />} onClick={() => setOpen(true)} /> : null}
          <nav className="breadcrumb" aria-label="Konum">
            {trail.length === 0 ? <span className="crumb is-current">Girişimci Aksiyon Planı</span> : null}
            {trail.map((c, i) => {
              const last = i === trail.length - 1
              return (
                <span key={`${c.label}-${i}`} style={{ display: 'contents' }}>
                  {i > 0 ? <CaretRight size={12} className="sep" aria-hidden /> : null}
                  {c.to && !last ? (
                    <Link to={c.to} className="crumb">{c.label}</Link>
                  ) : (
                    <span className={`crumb ${last ? 'is-current' : ''}`} aria-current={last ? 'page' : undefined} title={c.label}>{bp.md ? c.label : c.short}</span>
                  )}
                </span>
              )
            })}
          </nav>
          <div className="shell-status">
            <CommandPaletteButton />
            {plan?.example && bp.md ? <span className="tag">Örnek plan</span> : null}
            {plan ? <SaveStatus /> : null}
            <Button type="text" aria-label={nextTheme === 'dark' ? 'Koyu temaya geç' : 'Açık temaya geç'} icon={themeMode === 'dark' ? <Sun size={20} /> : <Moon size={20} />} onClick={() => setTheme(nextTheme)} />
          </div>
        </Layout.Header>
        <Layout.Content className="shell-content">
          <Outlet />
        </Layout.Content>
        <CommandPalette />
      </Layout>
      <Drawer open={open} onClose={() => setOpen(false)} placement="left" title={brand} size={Math.min(300, typeof window !== 'undefined' ? window.innerWidth - 24 : 300)} styles={{ body: { padding: 0 }, header: { padding: '0 8px', borderBottom: `1px solid ${token.colorBorder}` } }} afterOpenChange={(o) => { if (!o) nav(loc.pathname, { replace: true }) }}>
        {menu}
      </Drawer>
    </Layout>
  )
}
