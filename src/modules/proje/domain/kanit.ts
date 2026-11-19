/**
 * Sınama adımı için kanıt taslağının metni. Saf işlevdir.
 * Metni yazılım hazırlar. Taslağı bir kişi inceleyip kaydeder. Plan bu metinle değişmez.
 */
import type { Is, Proje } from './model'
import { isOzeti } from './islemler'
import { tarihYaz } from './tarih'

/** Çekirdeğin kanıt taslağı sınırı 2000 karakterdir. */
export const KANIT_SINIRI = 2000

export function kanitMetni(proje: Proje, isler: readonly Is[], bugun: string): string {
  const o = isOzeti(isler, bugun)
  const satirlar = [`Proje: ${proje.ad}.`, `Tarih: ${tarihYaz(bugun)}.`]
  if (!o.toplam) {
    satirlar.push('Projede henüz görev yok.')
  } else {
    const sayilar = [`Projede ${o.toplam} görev var.`, `${o.biten} görev bitti.`, `${o.acik} görev açık.`]
    if (o.iptal) sayilar.push(`${o.iptal} görev iptal edildi.`)
    satirlar.push(sayilar.join(' '))
    if (o.geciken) satirlar.push(`${o.geciken} görevin son tarihi geçti.`)
    const biten = isler.filter((is) => is.durum === 'bitti').map((is) => is.baslik)
    if (biten.length) satirlar.push(`Biten görevler: ${biten.join(', ')}.`)
  }
  const metin = satirlar.join('\n')
  /* Sınırı aşan metin kesilir. Kesildiği üç noktayla belli olur. */
  return metin.length <= KANIT_SINIRI ? metin : `${metin.slice(0, KANIT_SINIRI - 1)}…`
}
