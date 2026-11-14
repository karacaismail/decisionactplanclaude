import { describe, expect, it } from 'vitest'
import { emptyPlan, type PlanDoc } from '@/data/types'
import { STRENGTH_LABEL, strengthIssues, strengthLevel, strengthsCalc, strengthsOf } from './strengths'

const row = (name: string, a?: string, b?: string, c?: string, d?: string, basis?: string) => ({ _id: name, name, valuable: a, rare: b, hardToCopy: c, organized: d, basis })

describe('dört soruluk güç süzgeci', () => {
  it('ilk soru cevapsızsa güç henüz sınanmamıştır', () => {
    expect(strengthLevel(row('Usta ekip'))).toBe('bos')
  })
  it('arada cevapsız soru varsa güç henüz sınanmamıştır', () => {
    expect(strengthLevel(row('Usta ekip', 'evet', 'evet'))).toBe('bos')
  })
  it('işe yaramayan kaynak dezavantajdır', () => {
    expect(strengthLevel(row('Eski fırın', 'hayir'))).toBe('dezavantaj')
  })
  it('işe yarayan ama herkeste olan kaynak eşitliktir', () => {
    expect(strengthLevel(row('Güler yüz', 'evet', 'hayir'))).toBe('esitlik')
  })
  it('nadir ama kolay kopyalanan kaynak geçici avantajdır', () => {
    expect(strengthLevel(row('Köşe dükkân', 'evet', 'evet', 'hayir'))).toBe('gecici')
  })
  it('kopyalanamayan ama kullanılamayan kaynak kullanılmayan avantajdır', () => {
    expect(strengthLevel(row('Usta tarifi', 'evet', 'evet', 'evet', 'hayir'))).toBe('kullanilmayan')
  })
  it('dört sorudan geçen kaynak kalıcı avantajdır', () => {
    expect(strengthLevel(row('Usta ekip', 'evet', 'evet', 'evet', 'evet'))).toBe('kalici')
  })
  it('sonraki cevaplar önceki "hayır" cevabını değiştirmez', () => {
    expect(strengthLevel(row('Güler yüz', 'evet', 'hayir', 'evet', 'evet'))).toBe('esitlik')
  })
})

function planWith(strengths: unknown[], small = false): PlanDoc {
  const p = emptyPlan('p', 'Plan')
  p.profile.smallReversible = small
  p.steps['12'] = { values: { strengths }, status: 'taslak', updatedAt: '' }
  return p
}

describe('plandaki güçler', () => {
  it('adı olmayan satır sayılmaz', () => {
    const p = planWith([row(''), row('Usta ekip', 'evet', 'evet', 'evet', 'evet', 'Müşteri görüşmeleri')])
    expect(strengthsOf(p)).toEqual([{ id: 'Usta ekip', name: 'Usta ekip', level: 'kalici', basis: 'Müşteri görüşmeleri' }])
  })
  it('Adım 12 boşken liste boştur', () => {
    expect(strengthsOf(emptyPlan('p', 'Plan'))).toEqual([])
  })
})

describe('adımı tamamlama kuralı', () => {
  it('nadir denen güç dayanak ister', () => {
    const p = planWith([row('Köşe dükkân', 'evet', 'evet', 'hayir')])
    expect(strengthIssues(p.steps['12'].values, p)).toEqual(['"Köşe dükkân" için dayanak yazın. Nadir olduğunu nereden biliyorsunuz?'])
  })
  it('dayanak yazılınca engel kalkar', () => {
    const p = planWith([row('Köşe dükkân', 'evet', 'evet', 'hayir', undefined, 'Meydanda başka boş dükkân yok.')])
    expect(strengthIssues(p.steps['12'].values, p)).toEqual([])
  })
  it('herkeste olan güç dayanak istemez', () => {
    const p = planWith([row('Güler yüz', 'evet', 'hayir')])
    expect(strengthIssues(p.steps['12'].values, p)).toEqual([])
  })
  it('ağır yatırımda en az bir güç yazılır', () => {
    const p = planWith([])
    expect(strengthIssues(p.steps['12'].values, p)).toEqual(['Ağır yatırımda en az bir güçlü yön yazın. Her gücü dört soruyla sınayın.'])
  })
  it('küçük ve geri alınabilir işte güç yazmak zorunlu değildir', () => {
    const p = planWith([], true)
    expect(strengthIssues(p.steps['12'].values, p)).toEqual([])
  })
})

describe('süzgeç sonucu kutusu', () => {
  it('güç yokken sonuç yoktur', () => {
    expect(strengthsCalc({ strengths: [] })).toBeNull()
  })
  it('her gücü adı ve sonucuyla yazar', () => {
    const r = strengthsCalc({ strengths: [row('Usta ekip', 'evet', 'evet', 'evet', 'evet'), row('Güler yüz', 'evet', 'hayir')] })
    expect(r?.value).toBe('2 güçten 1 tanesi avantaj')
    expect(r?.lines).toEqual([`Usta ekip: ${STRENGTH_LABEL.kalici}. Dört sorudan da geçti.`, `Güler yüz: ${STRENGTH_LABEL.esitlik}. Rakiplerin çoğunda da var. Fark yaratmaz.`])
    expect(r?.warn).toBeUndefined()
  })
  it('hiçbir güç avantaj değilse uyarır', () => {
    const r = strengthsCalc({ strengths: [row('Güler yüz', 'evet', 'hayir')] })
    expect(r?.warn).toBe('Süzgeçten geçen avantaj yok. Bu bir bulgudur. Stratej bunu bilmelidir.')
  })
})
