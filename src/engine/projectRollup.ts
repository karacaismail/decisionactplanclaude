/**
 * Proje özetinin çekirdek okuyucusu. Saf işlevlerdir.
 * Özeti proje modülü yazar. Çekirdek modülü içe aktarmaz. Özeti yalnız altyapının özet deposundan okur.
 * Özet bozuksa ya da yoksa okuyucu undefined döner. Ekran o zaman etiket göstermez.
 * Özet hiçbir kontrolü, kilidi ya da eskime işaretini değiştirmez.
 */

/** Özeti yazan modülün kimliği. Özet deposunda bu adla durur. */
export const PROJECT_MODULE_ID = 'proje'

export interface ProjectRowCounts {
  projects: number
  open: number
  overdue: number
  done: number
}

export interface ProjectRollup extends ProjectRowCounts {
  /** Özetin hesaplandığı gün. "YYYY-AA-GG". */
  date: string
  /** Satır kimliğine göre sayılar. Satır ana hamle ya da "Şimdi" işidir. */
  rows: Record<string, ProjectRowCounts>
  /** Özet 4 KB sınırına sığmadıysa bazı satırlar eksiktir. */
  truncated: boolean
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const count = (v: unknown): number | undefined => (typeof v === 'number' && Number.isInteger(v) && v >= 0 ? v : undefined)

function countsOf(v: unknown): ProjectRowCounts | undefined {
  if (!isRecord(v)) return undefined
  const projects = count(v.proje)
  const open = count(v.acik)
  const overdue = count(v.geciken)
  const done = count(v.biten)
  if (projects === undefined || open === undefined || overdue === undefined || done === undefined) return undefined
  return { projects, open, overdue, done }
}

/** Modülün yazdığı özeti denetler ve çekirdeğin biçimine çevirir. */
export function parseProjectRollup(value: unknown): ProjectRollup | undefined {
  if (!isRecord(value) || value.v !== 1 || typeof value.tarih !== 'string' || !isRecord(value.hamleler)) return undefined
  const top = countsOf({ proje: value.projeSayisi, acik: value.acik, geciken: value.geciken, biten: value.biten })
  if (!top) return undefined
  const rows: Record<string, ProjectRowCounts> = Object.create(null) as Record<string, ProjectRowCounts>
  for (const [rowId, raw] of Object.entries(value.hamleler)) {
    const c = countsOf(raw)
    if (c) rows[rowId] = c
  }
  return { ...top, date: value.tarih, rows, truncated: value.kesik === true }
}

/** Satırın sayıları. Satırın projesi yoksa undefined döner. */
export function rowCounts(rollup: ProjectRollup | undefined, rowId: string): ProjectRowCounts | undefined {
  if (!rollup || !Object.prototype.hasOwnProperty.call(rollup.rows, rowId)) return undefined
  return rollup.rows[rowId]
}

export interface RowBadge {
  /** Projenin durumunu anlatan cümle. Satırın projesi yoksa yoktur. */
  summary?: string
  /** Geciken görev varsa bu cümle ikonla birlikte görünür. */
  overdue?: string
  /** Bağlantının görünen metni. */
  link: string
}

/** Satır etiketinin metinleri. Her cümle tek bir bilgi verir. */
export function rowBadge(c: ProjectRowCounts | undefined, opts: { truncated?: boolean } = {}): RowBadge {
  /* Kesik özette satır eksik olabilir. Bu yüzden "Proje aç" denmez. */
  if (!c && opts.truncated) return { link: 'Projeleri gör' }
  if (!c || c.projects === 0) return { link: 'Proje aç' }
  const where = c.projects === 1 ? 'Projede' : `${c.projects} projede`
  const summary = c.open > 0 ? `${where} ${c.open} görev açık.` : c.done > 0 ? `${where} ${c.done} görev bitti.` : `${where} henüz görev yok.`
  const badge: RowBadge = { summary, link: c.projects === 1 ? 'Projeyi aç' : 'Projeleri aç' }
  if (c.overdue > 0) badge.overdue = `${c.overdue} görev gecikti.`
  return badge
}

export interface ProjectCardLines {
  projects: string
  open: string
  overdue?: string
  done: string
}

/** "Uygulama" ekranındaki Projeler kartının cümleleri. */
export function projectCardLines(r: ProjectRollup): ProjectCardLines {
  const lines: ProjectCardLines = { projects: `${r.projects} proje var.`, open: `${r.open} görev açık.`, done: `${r.done} görev bitti.` }
  if (r.overdue > 0) lines.overdue = `${r.overdue} görev gecikti.`
  return lines
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Yerel takvimde bugünün günü. "YYYY-AA-GG". */
export function todayIso(d = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** "2026-11-19" gününü yerel takvimde ISO zamana çevirir. Böylece gün kaymaz. */
export function localIso(day: string): string | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day)
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).toISOString() : undefined
}
