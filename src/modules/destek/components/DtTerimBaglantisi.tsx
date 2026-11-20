import '@/styles/bilesen/DtTerimBaglantisi.css'
import { Link } from 'react-router'
import { SOZLUK } from '../data/sozluk'
import { terimBul } from '../metinler'

/** Terimin ilk geçtiği yerde sözlüğe bağlantı. Bağlantı terimi sözlükte açar. Bilinmeyen terimde bir şey çizilmez. */
export function DtTerimBaglantisi({ terim }: { terim: string | undefined }) {
  const t = terimBul(SOZLUK, terim)
  if (!t) return null
  return (
    <Link className="dt-terim-baglantisi" to={`/destek/sozluk?terim=${encodeURIComponent(t.id)}`}>
      “{t.ad}” ne demek?
    </Link>
  )
}
