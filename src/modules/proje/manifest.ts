/**
 * Proje yönetimi modülü. Bu modül numaralı üç aşamanın dışında durur.
 * Strateji onaylanınca ana hamlelerden proje açılır. Proje verisi plana yazılmaz.
 * Bildirim React içe aktarmaz. Ekranlar ve yaşam döngüsü geç yüklenir.
 */
import type { ModuleManifest } from '@/platform/types'

const manifest: ModuleManifest = {
  id: 'proje',
  title: 'Proje yönetimi',
  schemaVersion: 1,
  cssPrefix: 'pj-',
  nav: [{ to: '/projeler', label: 'Projeler', icon: 'kanban', requiresPlan: true, bottom: true }],
  routes: [
    { path: '/projeler', title: 'Projeler', requiresPlan: true, load: () => import('./screens/PjProjelerScreen') },
    { path: '/projeler/:pid', title: 'Proje', requiresPlan: true, example: '/projeler/ornek-proje', load: () => import('./screens/PjProjeScreen') },
    { path: '/projeler/:pid/is/:iid', title: 'Proje işi', requiresPlan: true, example: '/projeler/ornek-proje/is/ornek-is', load: () => import('./screens/PjIsScreen') },
  ],
  lifecycle: () => import('./lifecycle'),
}

export default manifest
