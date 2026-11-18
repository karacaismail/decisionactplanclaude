/**
 * Modül bildiriminin biçimi. Her modül `src/modules/<kimlik>/manifest.ts` dosyasında bu biçimi dışa aktarır.
 * Bildirim React içe aktarmaz. Ekranlar ve yaşam döngüsü kodu yalnız dinamik içe aktarmayla gelir.
 * Böylece modül kodu ilk açılışta inmez.
 */
import type { ComponentType } from 'react'

/** Modül ekranı. Varsayılan dışa aktarma bir React bileşenidir. */
export type ScreenModule = { default: ComponentType }

export interface ModuleRoute {
  /** Tam uygulama yolu. Örneğin "/projeler/:pid". */
  path: string
  /** Ekrandaki ana başlık. Denetim testi bu başlığı arar. */
  title: string
  load: () => Promise<ScreenModule>
  /** Açık plan gerekiyor mu? Gerekiyorsa plan yokken Planlar ekranına dönülür. */
  requiresPlan: boolean
  /** Parametreli yol için örnek adres. Denetim testi bu adresi açar. */
  example?: string
}

/** Kabuğun tanıdığı ikon adları. Bilinmeyen ad genel bir ikonla çizilir. */
export type ModuleIcon = 'kanban' | 'handCoins' | 'target' | 'files' | 'folder'

export interface ModuleNavEntry {
  to: string
  label: string
  icon: ModuleIcon
  requiresPlan: boolean
  /** Telefonun alt menüsünde görünür mü? */
  bottom?: boolean
  /**
   * Numarasız menü grubu. Örneğin "Destek ve teşvik".
   * Grup, menüde üç ana kümenin altında ayrı durur. Grup sıralı sürecin parçası değildir.
   */
  group?: string
}

/** Plan kimliği eşlemesi. Anahtar dosyadaki eski kimlik, değer yeni kimliktir. */
export type PlanIdMap = Readonly<Record<string, string>>

export interface ModuleLifecycle {
  /** Plan silinince çağrılır. Modül bu plana ait verisini siler. */
  onPlanDeleted?(planId: string): Promise<void> | void
  /** Plan içe alındıktan sonra çağrılır. */
  onPlanImported?(idMap: PlanIdMap): Promise<void> | void
  /** Planın modül verisini dosyaya yazılacak biçimde verir. Veri yoksa undefined döner. */
  exportSlice?(planId: string): Promise<unknown> | unknown
  /** Dosyadaki modül verisini yeni plan kimliğiyle yazar. Bozuk veride Türkçe hata fırlatır. */
  importSlice?(slice: unknown, idMap: PlanIdMap): Promise<void> | void
}

export interface ModuleManifest {
  /** Klasör adıyla aynıdır. Örneğin "proje". */
  id: string
  title: string
  /** Modül verisinin biçim sürümü. Dışa aktarılan dilim bu sürümü taşır. */
  schemaVersion: number
  /** CSS sınıf öneki. Örneğin "pj-". CSS dosya öneki bundan türer: "Pj". */
  cssPrefix: string
  nav: readonly ModuleNavEntry[]
  routes: readonly ModuleRoute[]
  /** Yaşam döngüsü kodu geç yüklenir. */
  lifecycle?: () => Promise<{ default: ModuleLifecycle }>
}
