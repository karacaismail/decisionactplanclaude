import { useLayoutEffect, useState } from 'react'
import { Button, Drawer, Grid, Layout, Menu, Space, Tag, Typography, theme } from 'antd'
import { Link, Outlet, useLocation, useNavigate } from 'react-router'
import { List, Folders, SquaresFour, Paperclip, CheckSquare, FileText, ClockCounterClockwise, Moon, Sun, Compass, ChartBar, BookOpenText, Briefcase, Users, MapTrifold, Handshake, Wallet, Package, ArrowsClockwise, Signpost } from '@phosphor-icons/react'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import { DECISIONS } from '@/data/decisions'
import { gatePassed } from '@/engine/gate'
import { SaveStatus } from '@/components/SaveStatus'
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

  const items = [
    { key: '/', icon: <Folders size={20} />, label: <Link to="/">Planlar</Link> },
    ...(plan
      ? [
          { key: '/baslangic', icon: <Compass size={20} />, label: <Link to="/baslangic">Giriş</Link> },
          { key: '/ozet', icon: <SquaresFour size={20} />, label: <Link to="/ozet">Plan özeti</Link> },
          {
            type: 'group' as const,
            label: 'Sekiz karar',
            children: DECISIONS.map((d) => {
              const Icon = decisionIcon(d.icon)
              const passed = gatePassed(plan, d.n)
              const locked = d.n > 1 && !gatePassed(plan, d.n - 1)
              return {
                key: `/karar/${d.n}`,
                icon: <Icon size={20} weight={passed ? 'fill' : 'regular'} />,
                label: (
                  <Link to={`/karar/${d.n}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span>{d.n}. {d.title}</span>
                    {passed ? <Tag color="success" style={{ fontSize: 14, margin: 0, lineHeight: '22px' }}>Geçti</Tag> : locked ? <Tag style={{ fontSize: 14, margin: 0, lineHeight: '22px' }}>Kilitli</Tag> : null}
                  </Link>
                ),
              }
            }),
          },
          { key: '/kanitlar', icon: <Paperclip size={20} />, label: <Link to="/kanitlar">Kanıtlar</Link> },
          { key: '/isler', icon: <CheckSquare size={20} />, label: <Link to="/isler">İşler</Link> },
          { key: '/ciktilar', icon: <FileText size={20} />, label: <Link to="/ciktilar">Çıktılar</Link> },
          { key: '/gecmis', icon: <ClockCounterClockwise size={20} />, label: <Link to="/gecmis">Geçmiş</Link> },
          { key: '/gostergeler', icon: <ChartBar size={20} />, label: <Link to="/gostergeler">Göstergeler</Link> },
        ]
      : []),
    { key: '/yontemler', icon: <BookOpenText size={20} />, label: <Link to="/yontemler">Karar Kitabı</Link> },
  ]
  const selected = loc.pathname.startsWith('/karar/') ? `/karar/${loc.pathname.split('/')[2]}` : loc.pathname
  const menu = <Menu mode="inline" items={items} selectedKeys={[selected]} onClick={() => setOpen(false)} style={{ border: 0, background: 'transparent', fontSize: 16 }} />
  const nextTheme = themeMode === 'dark' ? 'light' : 'dark'
  const brand = (
    <div className="brand">
      <span className="brand-mark" aria-hidden>
        <Compass size={24} weight="fill" />
      </span>
      <div className="brand-text">
        <strong>Girişimci Aksiyon Planı</strong>
        <span>Sekiz karar, tek yol</span>
      </div>
    </div>
  )

  return (
    <Layout style={{ minHeight: '100dvh', background: token.colorBgLayout }}>
      {wide ? (
        <Layout.Sider width={288} style={{ background: token.colorBgContainer, padding: '20px 12px', position: 'sticky', top: 0, height: '100dvh', overflowY: 'auto' }} className="no-print">
          {brand}
          {menu}
        </Layout.Sider>
      ) : null}
      <Layout style={{ minWidth: 0, background: token.colorBgLayout }}>
        <Layout.Header className="no-print" style={{ background: token.colorBgLayout, padding: wide ? '0 32px' : '0 16px', height: 64, lineHeight: '64px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${token.colorBorderSecondary}`, position: 'sticky', top: 0, zIndex: 10 }}>
          {!wide ? <Button type="text" aria-label="Menüyü aç" icon={<List size={24} />} onClick={() => setOpen(true)} /> : null}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
            <Typography.Text strong style={{ fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: '1 1 auto', minWidth: 48 }}>{plan?.name ?? 'Plan seçilmedi'}</Typography.Text>
            {plan && bp.md ? <Tag style={{ fontSize: 14, margin: 0, flexShrink: 0 }} className="tabular">Sürüm {plan.revision}</Tag> : null}
            {plan?.example && bp.md ? <Tag color="warning" style={{ fontSize: 14, margin: 0, flexShrink: 0 }}>Örnek plan</Tag> : null}
          </div>
          {plan ? <SaveStatus /> : null}
          <Space>
            <Button type="text" aria-label={nextTheme === 'dark' ? 'Koyu temaya geç' : 'Açık temaya geç'} icon={themeMode === 'dark' ? <Sun size={22} /> : <Moon size={22} />} onClick={() => setTheme(nextTheme)} />
          </Space>
        </Layout.Header>
        <Layout.Content style={{ padding: wide ? '32px 32px 56px' : '20px 16px 48px', maxWidth: 1280, margin: '0 auto', minWidth: 0, boxSizing: 'border-box', width: '100%' }}>
          <Outlet />
        </Layout.Content>
      </Layout>
      <Drawer open={open} onClose={() => setOpen(false)} placement="left" title={brand} size={Math.min(320, typeof window !== 'undefined' ? window.innerWidth - 24 : 320)} styles={{ body: { padding: 8 }, header: { padding: '8px 16px 0', borderBottom: 0 } }} afterOpenChange={(o) => { if (!o) nav(loc.pathname, { replace: true }) }}>
        {menu}
      </Drawer>
    </Layout>
  )
}
