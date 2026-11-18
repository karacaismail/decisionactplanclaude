import { DtBosEkran } from '../components/DtBosEkran'

/** Destek programları listesi. Bu ekran plan istemez. */
export default function DtProgramlarScreen() {
  return (
    <DtBosEkran
      title="Destek ve teşvik programları"
      kicker="Destek ve teşvik"
      description="Kurumların destek programları burada listelenecek. Bu ekran için plan gerekmez."
      emptyTitle="Program listesi hazırlanıyor."
      text="Programlar bir sonraki sürümde eklenecek."
    />
  )
}
