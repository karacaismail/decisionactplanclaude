import { useLayoutEffect, useState } from 'react'
import { Button, Drawer, Grid, Layout, Menu, theme } from 'antd'
import { Link, Outlet, useLocation, useNavigate } from 'react-router'
import { List, Folders, SquaresFour, Paperclip, CheckSquare, FileText, ClockCounterClockwise, Moon, Sun, Compass, ChartBar, BookOpenText, Briefcase, Users, MapTrifold, Handshake, Wallet, Package, ArrowsClockwise, Signpost, DoorOpen, Strategy, Stack, Lightbulb } from '@phosphor-icons/react'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import { DECISIONS } from '@/data/decisions'
import { STAGES } from '@/data/stages'
import { transitionPassed, lastTransition } from '@/engine/readiness'
import { decisionLocked, gatePassed } from '@/engine/gate'
import { SaveStatus } from '@/components/SaveStatus'
import { CommandPalette, CommandPaletteButton } from '@/components/CommandPalette'
import { cssVariables } from '@/theme/tokens'
import { resolveMode } from '@/theme/antdTheme'

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

  /* Yol dizini: Temel, Geçiş ve Uygulama. Yalnız yol ekranlarında görünür. */
  const journeyItems = plan
    ? [
        { key: '/baslangic', icon: <Compass size={20} />, label: <Link to="/baslangic"><span className="label">Giriş</span></Link> },
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
      ]
    : []

  /* Sıradaki iş: "Yol" sekmesi buraya gider. */
  const nextOpen = plan ? stage('temel').decisions.find((n) => !gatePassed(plan, n)) : undefined
  const journeyHome = !plan ? '/' : nextOpen ? `/karar/${nextOpen}` : !passedTransition ? '/gecis' : '/strateji'
  const isJourney = /^\/(karar|gecis|strateji|baslangic|devralma)/.test(loc.pathname)
  const tabs: { to: string; label: string; Icon: typeof Briefcase; active: boolean; needsPlan: boolean }[] = [
    { to: '/ozet', label: 'Pano', Icon: SquaresFour, active: loc.pathname === '/ozet', needsPlan: true },
    { to: journeyHome, label: 'Yol', Icon: MapTrifold, active: isJourney, needsPlan: true },
    { to: '/temel', label: 'Temel taşları', Icon: Stack, active: loc.pathname === '/temel', needsPlan: true },
    { to: '/varsayimlar', label: 'Varsayımlar', Icon: Lightbulb, active: loc.pathname === '/varsayimlar', needsPlan: true },
    { to: '/kanitlar', label: 'Kanıtlar', Icon: Paperclip, active: loc.pathname === '/kanitlar', needsPlan: true },
    { to: '/isler', label: 'İşler', Icon: CheckSquare, active: loc.pathname === '/isler', needsPlan: true },
    { to: '/gostergeler', label: 'Göstergeler', Icon: ChartBar, active: loc.pathname === '/gostergeler', needsPlan: true },
    { to: '/ciktilar', label: 'Çıktılar', Icon: FileText, active: loc.pathname === '/ciktilar', needsPlan: true },
    { to: '/gecmis', label: 'Geçmiş', Icon: ClockCounterClockwise, active: loc.pathname === '/gecmis', needsPlan: true },
    { to: '/yontemler', label: 'Karar Kitabı', Icon: BookOpenText, active: loc.pathname === '/yontemler', needsPlan: false },
  ].filter((t) => plan || !t.needsPlan)

  const selected = loc.pathname.startsWith('/karar/9') ? '/strateji' : loc.pathname.startsWith('/karar/') ? `/karar/${loc.pathname.split('/')[2]}` : loc.pathname
  const journeyMenu = <Menu className="shell-menu" mode="inline" items={journeyItems} selectedKeys={[selected]} onClick={() => setOpen(false)} />
  const nextTheme = themeMode === 'dark' ? 'light' : 'dark'
  const brand = (
    <Link to={plan ? '/ozet' : '/'} className="brand" aria-label="Girişimci Aksiyon Planı, panoya git">
      <span className="brand-mark" aria-hidden>
        <Compass size={18} weight="fill" />
      </span>
      <span className="brand-text">
        <strong>Aksiyon Planı</strong>
      </span>
    </Link>
  )
  const showRail = Boolean(wide && plan && isJourney)

  return (
    <Layout style={{ minHeight: '100dvh', background: token.colorBgLayout }}>
      <Layout.Header className="no-print topbar">
        {!wide ? <Button type="text" aria-label="Menüyü aç" icon={<List size={22} />} onClick={() => setOpen(true)} /> : null}
        {brand}
        {bp.md ? <span className="topbar-divider" aria-hidden /> : null}
        <nav className="topbar-context" aria-label="Konum">
          {bp.md ? (
            <Link to="/" title="Planlar">
              <Folders size={18} aria-hidden />
              <span className="crumb">{plan?.name ?? 'Planlar'}</span>
            </Link>
          ) : null}
          {plan?.example && bp.md ? <span className="tag">Örnek plan</span> : null}
        </nav>
        <div className="topbar-actions">
          <CommandPaletteButton />
          {plan ? <SaveStatus /> : null}
          <Button type="text" aria-label={nextTheme === 'dark' ? 'Koyu temaya geç' : 'Açık temaya geç'} icon={themeMode === 'dark' ? <Sun size={20} /> : <Moon size={20} />} onClick={() => setTheme(nextTheme)} />
        </div>
      </Layout.Header>
      {wide ? (
        <nav className="no-print product-nav" aria-label="Ana bölümler">
          {!plan ? (
            <Link to="/" aria-current={loc.pathname === '/' ? 'page' : undefined}>
              <Folders size={18} aria-hidden /> Planlar
            </Link>
          ) : null}
          {tabs.map((t) => (
            <Link key={t.label} to={t.to} aria-current={t.active ? 'page' : undefined}>
              <t.Icon size={18} weight={t.active ? 'fill' : 'regular'} aria-hidden /> {t.label}
            </Link>
          ))}
        </nav>
      ) : null}
      <div className={`shell-body ${showRail ? 'has-rail' : ''}`}>
        {showRail ? (
          <aside className="no-print journey-rail" aria-label="Yol dizini">
            <p className="journey-rail-title">
              <MapTrifold size={20} aria-hidden /> Yol dizini
            </p>
            <p className="journey-rail-sub">Temel, geçiş ve uygulama.</p>
            {journeyMenu}
          </aside>
        ) : null}
        <Layout.Content className="shell-content">
          <Outlet />
        </Layout.Content>
      </div>
      <CommandPalette />
      <Drawer open={open} onClose={() => setOpen(false)} placement="left" title="Menü" size={Math.min(320, typeof window !== 'undefined' ? window.innerWidth - 24 : 320)} styles={{ body: { padding: '0 0 24px' } }} afterOpenChange={(o) => { if (!o) nav(loc.pathname, { replace: true }) }}>
        <nav className="drawer-nav" aria-label="Ana bölümler">
          <Link to="/" aria-current={loc.pathname === '/' ? 'page' : undefined} onClick={() => setOpen(false)}>
            <Folders size={20} aria-hidden /> Planlar
          </Link>
          {tabs.map((t) => (
            <Link key={t.label} to={t.to} aria-current={t.active && !isJourney ? 'page' : undefined} onClick={() => setOpen(false)}>
              <t.Icon size={20} aria-hidden /> {t.label}
            </Link>
          ))}
        </nav>
        {plan ? (
          <>
            <p className="drawer-section">Yol dizini</p>
            <div style={{ padding: '0 12px' }}>{journeyMenu}</div>
          </>
        ) : null}
      </Drawer>
    </Layout>
  )
}
