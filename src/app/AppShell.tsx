import '@/styles/kabuk/kabuk.css'
import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react'
import { Button, Drawer, Layout, Menu, theme } from 'antd'
import { Link, Outlet, useLocation } from 'react-router'
import { NewPill } from '@/components/Pill'
import { isNewPage } from '@/data/newPages'
import { List, ListChecks, Folders, SquaresFour, Paperclip, CheckSquare, FileText, ClockCounterClockwise, Moon, Sun, Compass, ChartBar, BookOpenText, Briefcase, Users, MapTrifold, Handshake, Wallet, Package, ArrowsClockwise, Signpost, DoorOpen, Strategy, Stack, Lightbulb, Kanban, HandCoins, Target, Files } from '@phosphor-icons/react'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import { DECISIONS } from '@/data/decisions'
import { EXECUTION_DECISIONS, STAGES } from '@/data/stages'
import { transitionPassed, lastTransition } from '@/engine/readiness'
import { decisionLocked, gatePassed } from '@/engine/gate'
import { planPosition } from '@/engine/position'
import { SaveStatus } from '@/components/SaveStatus'
import { CommandPaletteButton, CommandPaletteHost } from '@/components/CommandPaletteButton'
import { cssVariables } from '@/theme/tokens'
import { BrandMark } from '@/components/BrandMark'
import { syncThemeColor } from './themeColor'
import { useResolvedTheme } from './printMode'
import { MODULE_NAV, type RegisteredNav } from '@/platform/modules'
import type { ModuleIcon } from '@/platform/types'
const ICONS: Record<string, typeof Briefcase> = { briefcase: Briefcase, users: Users, map: MapTrifold, handshake: Handshake, wallet: Wallet, package: Package, repeat: ArrowsClockwise, signpost: Signpost }

/* Modül bildirimi ikonu adla verir. Bilinmeyen ad genel ikonla çizilir. */
const MODULE_ICONS: Record<ModuleIcon, typeof Briefcase> = { kanban: Kanban, handCoins: HandCoins, target: Target, files: Files, folder: Folders }

/** Adrese en uzun önekle uyan modül bağlantısı seçilir. Böylece "/destek/eslesme" açıkken "/destek" seçili görünmez. */
function activeModulePath(pathname: string): string | undefined {
  return MODULE_NAV.map((n) => n.to)
    .filter((to) => pathname === to || pathname.startsWith(`${to}/`))
    .sort((a, b) => b.length - a.length)[0]
}

export function decisionIcon(name: string): typeof Briefcase {
  return ICONS[name] ?? Briefcase
}

/** Tokenları CSS değişkeni olarak köke yazar. global.css yalnız bunları okur. */
function useThemeVariables(pref: 'light' | 'dark' | 'system') {
  // Yazdırma sırasında açık temanın tokenları yazılır.
  const mode = useResolvedTheme()
  useLayoutEffect(() => {
    const root = document.documentElement
    for (const [k, v] of Object.entries(cssVariables(mode))) root.style.setProperty(k, v)
    syncThemeColor(pref)
  }, [pref, mode])
}

/** CSS bir gezinmeyi gizlerse odağı görünür eşine taşır. Yerleşimi değiştirmez. */
function useShellFocusContinuity() {
  useEffect(() => {
    let focused: HTMLElement | null = null
    const onFocus = (event: FocusEvent) => {
      focused = event.target instanceof HTMLElement ? event.target : null
    }
    const onResize = () => {
      if (!focused?.closest('.app-shell') || focused.getClientRects().length) return
      const href = focused.closest('a')?.getAttribute('href')
      const candidates = [...document.querySelectorAll<HTMLElement>('.app-shell a, .app-shell button')]
        .filter((element) => element.getClientRects().length)
      const counterpart = candidates.find((element) => href && element.getAttribute('href') === href)
      const fallback = candidates.find((element) => element.classList.contains('shell-menu-toggle'))
        ?? candidates.find((element) => element.classList.contains('brand'))
      const target = counterpart ?? fallback
      target?.focus({ preventScroll: true })
    }
    document.addEventListener('focusin', onFocus)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('focusin', onFocus)
      window.removeEventListener('resize', onResize)
    }
  }, [])
}

export function AppShell() {
  const { token } = theme.useToken()
  const loc = useLocation()
  const plan = useCurrentPlan()
  const themeMode = usePlanStore((s) => s.theme)
  const setTheme = usePlanStore((s) => s.setTheme)
  const [open, setOpen] = useState(false)
  const menuTrigger = useRef<HTMLButtonElement | null>(null)
  useThemeVariables(themeMode)
  useShellFocusContinuity()

  const openMenu = (event: MouseEvent<HTMLButtonElement>) => {
    menuTrigger.current = event.currentTarget
    event.currentTarget.focus()
    setOpen(true)
  }
  const restoreMenuFocus = (visible: boolean) => {
    if (visible || !menuTrigger.current) return
    const target = menuTrigger.current.getClientRects().length
      ? menuTrigger.current
      : document.querySelector<HTMLAnchorElement>('.app-shell .brand')
    target?.focus({ preventScroll: true })
  }

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
  /* Yer tek kaynaktan gelir. Pano, menü ve kilit aynı sırayı kullanır. */
  const position = plan ? planPosition(plan) : null
  const strategyState = !passedTransition ? 'Kilitli' : position?.strategyComplete ? 'Tamam' : 'Açık'
  const executionState = plan && !decisionLocked(plan, EXECUTION_DECISIONS[0]) ? 'Açık' : 'Kilitli'

  /* Yeni sayfanın bağlantı adına ", yeni" eklenir. Ekran okuyucu etiketi de duyurur. */
  const newSuffix = (path: string) => (isNewPage(path) ? ', yeni' : '')

  /* Yol dizini üç ana kümeye göre dizilir: strateji öncesi, strateji oluşturma, strateji uygulama. Yalnız yol ekranlarında görünür. */
  const journeyItems = plan
    ? [
        { key: '/baslangic', icon: <Compass size={20} />, label: <Link to="/baslangic"><span className="label">Giriş</span></Link> },
        {
          type: 'group' as const,
          label: '1. Strateji öncesi',
          children: [
            ...stage('temel').decisions.map(decisionItem),
            {
              key: '/devir',
              icon: <FileText size={20} />,
              label: (
                <Link to="/devir" aria-label={`Strateje teslim raporu${newSuffix('/devir')}`}>
                  <span className="label">Teslim raporu</span>
                  <NewPill path="/devir" />
                </Link>
              ),
            },
            {
              key: '/gecis',
              icon: <DoorOpen size={20} weight={passedTransition ? 'fill' : 'regular'} />,
              label: (
                <Link to="/gecis" aria-label={`Hazırlık kontrolü, ${transitionState}${lastTransition(plan)?.stale ? ', inceleme bekliyor' : ''}${newSuffix('/gecis')}`}>
                  <span className="label">Hazırlık kontrolü</span>
                  <NewPill path="/gecis" />
                  <span className={`status-dot ${passedTransition ? 'is-passed' : foundationDone ? 'is-current' : ''}`} aria-hidden />
                </Link>
              ),
            },
          ],
        },
        {
          type: 'group' as const,
          label: '2. Strateji oluşturma',
          children: [
            {
              key: '/strateji',
              icon: <Strategy size={20} />,
              label: (
                <Link to="/strateji" aria-label={`Strateji oluşturma, ${strategyState}${newSuffix('/strateji')}`}>
                  <span className="label">Strateji oluşturma</span>
                  <NewPill path="/strateji" />
                  <span className={`status-dot ${strategyState === 'Tamam' ? 'is-passed' : strategyState === 'Açık' ? 'is-current' : ''}`} aria-hidden />
                </Link>
              ),
            },
          ],
        },
        {
          type: 'group' as const,
          label: '3. Strateji uygulama',
          children: [
            {
              key: '/uygulama',
              icon: <ListChecks size={20} />,
              label: (
                <Link to="/uygulama" aria-label={`Strateji uygulama özeti, ${executionState}${newSuffix('/uygulama')}`}>
                  <span className="label">Uygulama özeti</span>
                  <NewPill path="/uygulama" />
                  <span className={`status-dot ${executionState === 'Açık' ? 'is-current' : ''}`} aria-hidden />
                </Link>
              ),
            },
            ...stage('uygulama').decisions.map(decisionItem),
          ],
        },
      ]
    : []

  /* Sıradaki iş: "Yol" sekmesi buraya gider. Sıra: temel kararı, hazırlık kontrolü, strateji oluşturma, uygulama kararı. */
  const journeyHome = !position
    ? '/'
    : position.stage === 'gecis'
      ? '/gecis'
      : position.stage === 'strateji'
        ? '/strateji'
        : `/karar/${position.decision ?? EXECUTION_DECISIONS[EXECUTION_DECISIONS.length - 1]}`
  const isJourney = /^\/(karar|gecis|devir|strateji|uygulama|baslangic|devralma)/.test(loc.pathname)
  /* Modül bağlantıları bildirimden gelir. Grubu olmayan bağlantı ana bölümlere girer. */
  const moduleActive = activeModulePath(loc.pathname)
  const moduleTab = (n: RegisteredNav) => ({ to: n.to, label: n.label, Icon: MODULE_ICONS[n.icon] ?? SquaresFour, active: moduleActive === n.to, needsPlan: n.requiresPlan, bottom: Boolean(n.bottom) })
  const moduleTabs = MODULE_NAV.filter((n) => !n.group).map(moduleTab)
  /* Numarasız modül grupları. Örneğin "Destek ve teşvik". Üç ana kümenin altında ayrı durur. */
  const moduleGroups = [...new Set(MODULE_NAV.map((n) => n.group).filter((g): g is string => Boolean(g)))].map((label) => ({
    label,
    entries: MODULE_NAV.filter((n) => n.group === label && (plan || !n.requiresPlan)),
  })).filter((g) => g.entries.length > 0)
  const tabs: { to: string; label: string; Icon: typeof Briefcase; active: boolean; needsPlan: boolean; newPath?: string; bottom?: boolean }[] = [
    { to: '/ozet', label: 'Pano', Icon: SquaresFour, active: loc.pathname === '/ozet', needsPlan: true, bottom: true },
    { to: journeyHome, label: 'Yol', Icon: MapTrifold, active: isJourney, needsPlan: true, bottom: true },
    ...moduleTabs,
    { to: '/temel', label: 'Temel sorular', Icon: Stack, active: loc.pathname === '/temel', needsPlan: true, newPath: '/temel' },
    { to: '/varsayimlar', label: 'Varsayımlar', Icon: Lightbulb, active: loc.pathname === '/varsayimlar', needsPlan: true, newPath: '/varsayimlar' },
    { to: '/kanitlar', label: 'Kanıtlar', Icon: Paperclip, active: loc.pathname === '/kanitlar', needsPlan: true },
    { to: '/isler', label: 'İşler', Icon: CheckSquare, active: loc.pathname === '/isler', needsPlan: true },
    { to: '/gostergeler', label: 'Göstergeler', Icon: ChartBar, active: loc.pathname === '/gostergeler', needsPlan: true },
    { to: '/ciktilar', label: 'Çıktılar', Icon: FileText, active: loc.pathname === '/ciktilar', needsPlan: true },
    { to: '/gecmis', label: 'Geçmiş', Icon: ClockCounterClockwise, active: loc.pathname === '/gecmis', needsPlan: true },
    { to: '/yontemler', label: 'Karar Kitabı', Icon: BookOpenText, active: loc.pathname === '/yontemler', needsPlan: false },
  ].filter((t) => plan || !t.needsPlan)
  /* Geniş ekranda grup tek bağlantıyla görünür. Bağlantı grubun ilk ekranını açar. */
  const groupTabs = moduleGroups.map((g) => ({
    to: g.entries[0].to,
    label: g.label,
    Icon: MODULE_ICONS[g.entries[0].icon] ?? SquaresFour,
    active: g.entries.some((n) => n.to === moduleActive),
  }))
  const moduleMenu = moduleGroups.length ? (
    <Menu
      className="shell-menu"
      mode="inline"
      selectedKeys={moduleActive ? [moduleActive] : []}
      onClick={() => setOpen(false)}
      items={moduleGroups.map((g) => ({
        type: 'group' as const,
        label: g.label,
        children: g.entries.map((n) => {
          const Icon = MODULE_ICONS[n.icon] ?? SquaresFour
          return { key: n.to, icon: <Icon size={20} />, label: <Link to={n.to}><span className="label">{n.label}</span></Link> }
        }),
      }))}
    />
  ) : null

  const selected = loc.pathname.startsWith('/karar/9') ? '/strateji' : loc.pathname.startsWith('/karar/') ? `/karar/${loc.pathname.split('/')[2]}` : loc.pathname
  const journeyMenu = <Menu className="shell-menu" mode="inline" items={journeyItems} selectedKeys={[selected]} onClick={() => setOpen(false)} />
  const nextTheme = themeMode === 'dark' ? 'light' : 'dark'
  const brand = (
    <Link to={plan ? '/ozet' : '/'} className="brand" aria-label="Girişimci Aksiyon Planı, panoya git">
      <span className="brand-mark" aria-hidden>
        <BrandMark />
      </span>
      <span className="brand-text">
        <strong>Aksiyon Planı</strong>
      </span>
    </Link>
  )
  const showRail = Boolean(plan && isJourney)

  return (
    <Layout className={`app-shell${plan ? ' has-plan' : ''}`} style={{ minHeight: '100dvh', background: token.colorBgLayout }}>
      <Layout.Header className="no-print topbar">
        <Button className="shell-menu-toggle" type="text" aria-label="Menüyü aç" aria-haspopup="dialog" aria-expanded={open} icon={<List size={22} />} onClick={openMenu} />
        {brand}
        <span className="topbar-divider" aria-hidden />
        <nav className="topbar-context" aria-label="Konum">
            <Link to="/" title={plan?.name ?? 'Planlar'} aria-label={plan ? `${plan.name}. Planlara git` : 'Planlar'}>
              <Folders size={18} aria-hidden />
              <span className="crumb">{plan?.name ?? 'Planlar'}</span>
            </Link>
          {plan?.example ? <span className="tag">Örnek plan</span> : null}
        </nav>
        <div className="topbar-actions">
          <CommandPaletteButton />
          <Button type="text" aria-label={nextTheme === 'dark' ? 'Koyu temaya geç' : 'Açık temaya geç'} icon={themeMode === 'dark' ? <Sun size={20} /> : <Moon size={20} />} onClick={() => setTheme(nextTheme)} />
        </div>
        {plan ? <div className="topbar-save"><SaveStatus /></div> : null}
      </Layout.Header>
        <nav className="no-print product-nav" aria-label="Ana bölümler">
          {!plan ? (
            <Link to="/" aria-current={loc.pathname === '/' ? 'page' : undefined}>
              <Folders size={18} aria-hidden /> Planlar
            </Link>
          ) : null}
          {tabs.map((t) => (
            <Link key={t.label} to={t.to} aria-current={t.active ? 'page' : undefined}>
              <t.Icon size={18} weight={t.active ? 'fill' : 'regular'} aria-hidden /> {t.label}
              {t.newPath ? <NewPill path={t.newPath} /> : null}
            </Link>
          ))}
          {groupTabs.map((t) => (
            <Link key={t.label} to={t.to} aria-current={t.active ? 'page' : undefined}>
              <t.Icon size={18} weight={t.active ? 'fill' : 'regular'} aria-hidden /> {t.label}
            </Link>
          ))}
        </nav>
      <div className={`shell-body ${showRail ? 'has-rail' : ''}`}>
        {showRail ? (
          <aside className="no-print journey-rail" aria-label="Yol dizini">
            <p className="journey-rail-title">
              <MapTrifold size={20} aria-hidden /> Yol dizini
            </p>
            <p className="journey-rail-sub">Hazırlık, oluşturma ve uygulama.</p>
            {journeyMenu}
          </aside>
        ) : null}
        <Layout.Content className="shell-content">
          <Outlet />
        </Layout.Content>
      </div>
      <nav className="no-print bottom-nav" aria-label="Alt gezinme">
        <Link to="/" aria-current={loc.pathname === '/' ? 'page' : undefined}>
          <Folders size={20} aria-hidden />
          <span>Planlar</span>
        </Link>
        {plan ? tabs.filter((t) => t.bottom).map((t) => (
          <Link key={t.label} to={t.to} aria-current={t.active ? 'page' : undefined}>
            <t.Icon size={20} weight={t.active ? 'fill' : 'regular'} aria-hidden />
            <span>{t.label}</span>
          </Link>
        )) : (
          <Link to="/yontemler" aria-current={loc.pathname === '/yontemler' ? 'page' : undefined}>
            <BookOpenText size={20} aria-hidden />
            <span>Karar Kitabı</span>
          </Link>
        )}
        <button type="button" onClick={openMenu} aria-haspopup="dialog" aria-expanded={open}>
          <List size={20} aria-hidden />
          <span>Menü</span>
        </button>
      </nav>
      <CommandPaletteHost />
      <Drawer rootClassName="shell-drawer" open={open} onClose={() => setOpen(false)} afterOpenChange={restoreMenuFocus} placement="left" title="Menü" size="var(--shell-drawer-width)">
        <nav className="drawer-nav" aria-label="Ana bölümler">
          <Link to="/" aria-current={loc.pathname === '/' ? 'page' : undefined} onClick={() => setOpen(false)}>
            <Folders size={20} aria-hidden /> Planlar
          </Link>
          {tabs.map((t) => (
            <Link key={t.label} to={t.to} aria-current={t.active ? 'page' : undefined} onClick={() => setOpen(false)}>
              <t.Icon size={20} aria-hidden /> {t.label}
              {t.newPath ? <NewPill path={t.newPath} /> : null}
            </Link>
          ))}
        </nav>
        {plan ? (
          <>
            <p className="drawer-section">Yol dizini</p>
            <div className="drawer-journey">{journeyMenu}</div>
          </>
        ) : null}
        {moduleMenu ? <div className="drawer-journey drawer-modules">{moduleMenu}</div> : null}
      </Drawer>
    </Layout>
  )
}
