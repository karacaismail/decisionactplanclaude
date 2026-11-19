import { Component, type ReactNode } from 'react'
import { Button } from 'antd'
import { Link } from 'react-router'
import { Callout } from '@/components/Callout'

type RouteErrorProps = {
  children: ReactNode
  routeKey: string
  hasPlan: boolean
  /** Açılamayan ekranın adresi. Dönüş bağlantısı aynı ekranı göstermez. */
  pathname: string
  /** Son değişiklik tarayıcıya yazılamadıysa true olur. Bu durumda yeniden yükleme değişikliği siler. */
  unsaved: boolean
  onDownload: () => void
}
type RouteErrorState = { failed: boolean; routeKey: string }

/**
 * Ekran hatası menüyü kapatmaz. Başka bir adrese geçilince hata alanı temizlenir.
 * Metin üç şeyi söyler: ne oldu, veri güvende mi, şimdi ne yapılır.
 * Ekranın çizilememesi kayıtlı veriyi değiştirmez. Bu yüzden "Planlarınız güvende." yazılır.
 * Son değişiklik kaydedilemediyse bu söz verilmez. Önce kopya indirme düğmesi gösterilir.
 * Dönüş bağlantısı açılamayan ekranı göstermez. Örneğin pano açılamazsa bağlantı planlara döner.
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
    const { hasPlan, pathname, unsaved, onDownload } = this.props
    const back = hasPlan && pathname !== '/ozet' ? { to: '/ozet', label: 'Panoya dön' } : pathname !== '/' ? { to: '/', label: 'Planlara dön' } : null
    return (
      <div className="route-error">
        <Callout tone="uyari" title="Ekran açılamadı">
          {unsaved ? (
            <>
              <p>Bu ekran yüklenirken bir sorun çıktı. Son değişiklikleriniz yalnız bu sekmede duruyor.</p>
              <p>Önce kopyanızı indirin. Sonra sayfayı yeniden yükleyin.</p>
            </>
          ) : (
            <>
              <p>Bu ekran yüklenirken bir sorun çıktı. Planlarınız güvende. Kayıtlı veri değişmedi.</p>
              <p>Sayfayı yeniden yükleyin. Sorun sürerse başka bir ekrana dönün.</p>
            </>
          )}
          <div className="route-error-actions">
            {unsaved ? <Button onClick={onDownload}>Kopyamı indir (JSON)</Button> : null}
            {/* React.lazy başarısız sonucu saklar. Tam yenileme bu kaydı da temizler. */}
            <Button onClick={() => window.location.reload()}>Sayfayı yeniden yükle</Button>
            {back ? <Link to={back.to}>{back.label}</Link> : null}
          </div>
        </Callout>
      </div>
    )
  }
}
