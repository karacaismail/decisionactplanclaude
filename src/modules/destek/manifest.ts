/**
 * Destek ve teşvik modülü. Bu modül numaralı üç aşamanın dışında durur.
 * Menüde ayrı ve numarasız bir grup olarak görünür.
 * Program listesi, eşleşme, belge listesi, gider rehberi ve sözlük plan istemez. Başvurular açık plan ister.
 */
import type { ModuleManifest } from '@/platform/types'

const GROUP = 'Destek ve teşvik'

const manifest: ModuleManifest = {
  id: 'destek',
  title: 'Destek ve teşvik',
  schemaVersion: 1,
  cssPrefix: 'dt-',
  nav: [
    { to: '/destek', label: 'Destek programları', icon: 'handCoins', requiresPlan: false, group: GROUP },
    { to: '/destek/eslesme', label: 'Size uygun destekler', icon: 'target', requiresPlan: false, group: GROUP },
    { to: '/destek/basvurular', label: 'Başvurularım', icon: 'files', requiresPlan: true, group: GROUP },
    { to: '/destek/belgeler', label: 'Belge ve kanıt listesi', icon: 'listChecks', requiresPlan: false, group: GROUP },
    { to: '/destek/giderler', label: 'Gider rehberi', icon: 'wallet', requiresPlan: false, group: GROUP },
    { to: '/destek/sozluk', label: 'Destek sözlüğü', icon: 'book', requiresPlan: false, group: GROUP },
  ],
  routes: [
    { path: '/destek', title: 'Destek ve teşvik programları', requiresPlan: false, load: () => import('./screens/DtProgramlarScreen') },
    { path: '/destek/eslesme', title: 'Size uygun destekler', requiresPlan: false, load: () => import('./screens/DtEslesmeScreen') },
    { path: '/destek/basvurular', title: 'Başvurularım', requiresPlan: true, load: () => import('./screens/DtBasvurularScreen') },
    { path: '/destek/belgeler', title: 'Belge ve kanıt listesi', requiresPlan: false, load: () => import('./screens/DtBelgelerScreen') },
    { path: '/destek/giderler', title: 'Gider rehberi', requiresPlan: false, load: () => import('./screens/DtGiderlerScreen') },
    { path: '/destek/sozluk', title: 'Destek sözlüğü', requiresPlan: false, load: () => import('./screens/DtSozlukScreen') },
    { path: '/destek/:programId', title: 'Destek programı', requiresPlan: false, example: '/destek/ornek-program', load: () => import('./screens/DtProgramScreen') },
  ],
  lifecycle: () => import('./lifecycle'),
}

export default manifest
