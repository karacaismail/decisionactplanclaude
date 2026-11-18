/**
 * Giriş katmanı yükleyicisi.
 * Dokunma ve fare için ayrı CSS dosyası vardır. Yükleyici yalnız cihazın kullandığı katmanı indirir.
 * Hibrit cihaz iki katmanı da indirir. Sonradan fare takılırsa fare katmanı o an iner.
 * Yükleyici cihaz adına bakmaz. Yalnız tarayıcının giriş sorgularını kullanır.
 * Doğruluk kuralları bu katmanlarda durmaz. Katman geç inerse arayüz bozulmaz. Ayrıntı: docs/css-mimarisi.md
 */

export type InputLayer = 'dokunma' | 'fare'

export const INPUT_QUERIES: Record<InputLayer, string> = {
  dokunma: '(any-pointer: coarse)',
  fare: '(any-pointer: fine) and (any-hover: hover)',
}

type MediaList = {
  readonly matches: boolean
  addEventListener: (type: 'change', listener: (event: { matches: boolean }) => void) => void
}

type Dependencies = {
  matchMedia: (query: string) => MediaList
  loaders: Record<InputLayer, () => Promise<unknown>>
}

export function createInputStyleLoader({ matchMedia, loaders }: Dependencies) {
  const done = new Set<InputLayer>()
  const pending = new Map<InputLayer, Promise<void>>()

  const load = (layer: InputLayer) => {
    if (done.has(layer)) return Promise.resolve()
    const current = pending.get(layer)
    if (current) return current
    const task = loaders[layer]()
      .then(() => {
        done.add(layer)
        document.documentElement.setAttribute(`data-giris-${layer}`, 'hazir')
      })
      .catch(() => {
        /* Katman inmezse temel kurallar çalışmaya devam eder. Sorgu yeniden eşleşince yeniden denenir. */
      })
      .finally(() => pending.delete(layer))
    pending.set(layer, task)
    return task
  }

  const start = async () => {
    const tasks: Promise<void>[] = []
    for (const layer of Object.keys(INPUT_QUERIES) as InputLayer[]) {
      const media = matchMedia(INPUT_QUERIES[layer])
      media.addEventListener('change', (event) => {
        if (event.matches) void load(layer)
      })
      if (media.matches) tasks.push(load(layer))
    }
    await Promise.all(tasks)
  }

  return {
    start,
    /** Süren yüklemeler bitince çözülür. Testler için. */
    settled: async () => {
      await Promise.all([...pending.values()])
    },
    loaded: () => [...done].sort(),
  }
}

/** Uygulama açılınca bir kez çağrılır. */
export function loadInputStyles() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
  const loader = createInputStyleLoader({
    matchMedia: (query) => window.matchMedia(query),
    loaders: {
      dokunma: () => import('@/styles/giris/dokunma.css'),
      fare: () => import('@/styles/giris/fare.css'),
    },
  })
  /*
   * Yükleme, uygulamanın ilk çalışması bittikten sonra başlar. Giriş katmanı zorunlu değildir, ilk çizimi beklemez.
   * Ayrıca WebKit, açılışta başlayan bir dinamik import başka bir ekran kodu beklerken sayfa görüntüsünü kilitliyor.
   * Bu durum tests/teslim.spec.ts içindeki "ekran kodu beklenirken" testiyle yakalandı.
   */
  window.setTimeout(() => void loader.start(), 0)
}
