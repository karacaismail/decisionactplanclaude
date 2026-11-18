import { DtBosEkran } from '../components/DtBosEkran'

/** Planın başvuruları. Başvuru verisi plana yazılmaz. */
export default function DtBasvurularScreen() {
  return (
    <DtBosEkran
      title="Başvurularım"
      kicker="Destek ve teşvik"
      description="Bir programa başvurunca başvurunuzu buradan izleyeceksiniz."
      emptyTitle="Başvurularınız burada görünecek."
      text="Henüz başvuru yok."
    />
  )
}
