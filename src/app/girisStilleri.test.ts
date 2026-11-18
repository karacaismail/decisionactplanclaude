import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import { INPUT_QUERIES, createInputStyleLoader, type InputLayer } from './girisStilleri'

/* Sahte medya sorgusu. Testte giriş türünü sonradan değiştirmek için kullanılır. */
function fakeMedia(initial: Record<string, boolean>) {
  const state = { ...initial }
  const listeners = new Map<string, Set<(event: { matches: boolean }) => void>>()
  const matchMedia = (query: string) => ({
    get matches() {
      return Boolean(state[query])
    },
    addEventListener: (_: 'change', listener: (event: { matches: boolean }) => void) => {
      if (!listeners.has(query)) listeners.set(query, new Set())
      listeners.get(query)!.add(listener)
    },
    removeEventListener: (_: 'change', listener: (event: { matches: boolean }) => void) => {
      listeners.get(query)?.delete(listener)
    },
  })
  const set = (query: string, matches: boolean) => {
    state[query] = matches
    for (const listener of listeners.get(query) ?? []) listener({ matches })
  }
  return { matchMedia, set }
}

function setup(initial: Record<string, boolean>) {
  const media = fakeMedia(initial)
  const loads: InputLayer[] = []
  const loaders = {
    dokunma: vi.fn(async () => void loads.push('dokunma')),
    fare: vi.fn(async () => void loads.push('fare')),
  }
  const loader = createInputStyleLoader({ matchMedia: media.matchMedia, loaders })
  return { media, loads, loaders, loader }
}

describe('giriş stilleri yükleyicisi', () => {
  it('yalnız dokunma olan cihazda yalnız dokunma katmanını yükler', async () => {
    const { loads, loader } = setup({ [INPUT_QUERIES.dokunma]: true })
    await loader.start()
    expect(loads).toEqual(['dokunma'])
  })

  it('yalnız fare olan cihazda yalnız fare katmanını yükler', async () => {
    const { loads, loader } = setup({ [INPUT_QUERIES.fare]: true })
    await loader.start()
    expect(loads).toEqual(['fare'])
  })

  it('hibrit cihazda iki katmanı da yükler', async () => {
    const { loads, loader } = setup({ [INPUT_QUERIES.dokunma]: true, [INPUT_QUERIES.fare]: true })
    await loader.start()
    expect(loads.sort()).toEqual(['dokunma', 'fare'])
  })

  it('sonradan fare takılınca fare katmanını o an yükler ve bir kez yükler', async () => {
    const { media, loads, loaders, loader } = setup({ [INPUT_QUERIES.dokunma]: true })
    await loader.start()
    media.set(INPUT_QUERIES.fare, true)
    media.set(INPUT_QUERIES.fare, false)
    media.set(INPUT_QUERIES.fare, true)
    await loader.settled()
    expect(loads).toEqual(['dokunma', 'fare'])
    expect(loaders.fare).toHaveBeenCalledTimes(1)
  })

  it('yükleme hatasında katmanı yeniden denemeye açık bırakır', async () => {
    const media = fakeMedia({ [INPUT_QUERIES.fare]: true })
    let attempt = 0
    const loader = createInputStyleLoader({
      matchMedia: media.matchMedia,
      loaders: {
        dokunma: async () => undefined,
        fare: async () => {
          attempt += 1
          if (attempt === 1) throw new Error('ağ hatası')
        },
      },
    })
    await loader.start()
    expect(loader.loaded()).toEqual([])
    media.set(INPUT_QUERIES.fare, false)
    media.set(INPUT_QUERIES.fare, true)
    await loader.settled()
    expect(loader.loaded()).toEqual(['fare'])
  })

  it('cihaz adına bakmaz', () => {
    const source = readFileSync('src/app/girisStilleri.ts', 'utf8')
    expect(source).toMatch(/matchMedia/)
    expect(source).not.toMatch(/userAgent|isMobile|navigator\.platform/)
  })
})
