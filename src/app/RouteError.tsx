import { Component, type ReactNode } from 'react'
import { Button } from 'antd'
import { Link } from 'react-router'
import { Callout } from '@/components/Callout'

type RouteErrorProps = { children: ReactNode; routeKey: string; hasPlan: boolean }
type RouteErrorState = { failed: boolean; routeKey: string }

/**
 * Ekran hatası menüyü kapatmaz. Başka bir adrese geçilince hata alanı temizlenir.
 * Metin üç şeyi söyler: ne oldu, veri güvende mi, şimdi ne yapılır.
 * Ekranın çizilememesi kayıtlı veriyi değiştirmez. Bu yüzden "Planlarınız güvende." yazılır.
 */
export class RouteErrorBoundary extends Component<RouteErrorProps, RouteErrorState> {
  state: RouteErrorState = { failed: false, routeKey: this.props.routeKey }

  static getDerivedStateFromError(): Partial<RouteErrorState> {
    return { failed: true }
  }

  static getDerivedStateFromProps(props: RouteErrorProps, state: RouteErrorState): RouteErrorState | null {
    return props.routeKey !== state.routeKey ? { failed: false, routeKey: props.routeKey } : null
  }

  render() {
    if (!this.state.failed) return this.props.children
    const back = this.props.hasPlan ? { to: '/ozet', label: 'Panoya dön' } : { to: '/', label: 'Planlara dön' }
    return (
      <div className="route-error">
        <Callout tone="uyari" title="Ekran açılamadı">
          <p>Bu ekran yüklenirken bir sorun çıktı. Planlarınız güvende. Kayıtlı veri değişmedi.</p>
          <p>Sayfayı yeniden yükleyin. Sorun sürerse başka bir ekrana dönün.</p>
          <div className="route-error-actions">
            {/* React.lazy başarısız sonucu saklar. Tam yenileme bu kaydı da temizler. */}
            <Button onClick={() => window.location.reload()}>Sayfayı yeniden yükle</Button>
            <Link to={back.to}>{back.label}</Link>
          </div>
        </Callout>
      </div>
    )
  }
}
