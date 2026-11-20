const BOLGESEL = new Set(['istka', 'techIstanbul'])

export function programEtiketi(id: string): string | undefined {
  if (BOLGESEL.has(id)) return 'Yalnız belli il veya bölge'
  if (id === 'turkpatent') return 'Destek değil'
  return undefined
}
