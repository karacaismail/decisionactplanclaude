import { DtBosEkran } from '../components/DtBosEkran'

/** Plana uygun destekler. Yazılım karşılaştırır. Kararı kişi verir. */
export default function DtEslesmeScreen() {
  return (
    <DtBosEkran
      title="Size uygun destekler"
      kicker="Destek ve teşvik"
      description="Yazılım planınızı programların koşullarıyla karşılaştıracak. Başvuru kararı sizindir."
      emptyTitle="Uygun programlar burada görünecek."
      text="Karşılaştırma bir sonraki sürümde gelecek."
    />
  )
}
