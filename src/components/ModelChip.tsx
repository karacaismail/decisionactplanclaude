import { useState } from 'react'
import { Button, Drawer, Space, Tag, Typography, theme } from 'antd'
import { BookOpen, ArrowSquareOut } from '@phosphor-icons/react'
import models from '@/data/models.json'
import { Callout } from './Callout'

interface Model {
  g: number
  slug: string
  title: string
  question: string
  summary: string
  section: string
  sectionNo: number
  no: number
  simple: string | null
  example: { title: string; text: string } | null
}

const ALL = models as Model[]
export function modelByIndex(g: number): Model | undefined {
  return ALL[g - 1]
}

const KARAR_KITABI = 'https://karacaismail.github.io/karar/'

/** Adım içinde Karar Kitabı modeli. Tıklanınca çekmece açılır. Bölüm adı ve sırası yazar. */
export function ModelChips({ indexes }: { indexes: number[] }) {
  const { token } = theme.useToken()
  const [open, setOpen] = useState<Model | null>(null)
  if (!indexes.length) return null
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <span style={{ fontSize: 14, color: token.colorTextSecondary, display: 'flex', alignItems: 'center', gap: 6 }}>
        <BookOpen size={18} aria-hidden /> Karar Kitabı'nda hangi modeller var?
      </span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {indexes.map((g) => {
          const m = modelByIndex(g)
          if (!m) return null
          return (
            <Button key={g} size="middle" onClick={() => setOpen(m)} style={{ height: 'auto', padding: '6px 12px', textAlign: 'left', whiteSpace: 'normal' }}>
              <span style={{ display: 'grid' }}>
                <span style={{ fontWeight: 500 }}>{m.title}</span>
                <span style={{ fontSize: 14, color: token.colorTextSecondary }}>{m.section}, {m.no}. sırada</span>
              </span>
            </Button>
          )
        })}
      </div>
      <Drawer open={Boolean(open)} onClose={() => setOpen(null)} title={open?.title} width={Math.min(520, typeof window !== 'undefined' ? window.innerWidth : 520)} styles={{ body: { display: 'grid', gap: 16, alignContent: 'start' } }}>
        {open ? (
          <>
            <Space wrap>
              <Tag style={{ fontSize: 14 }}>{open.section}</Tag>
              <Tag style={{ fontSize: 14 }}>Bölümde {open.no}. sırada</Tag>
            </Space>
            <Typography.Text type="secondary">{open.question}</Typography.Text>
            {open.simple ? <Callout tone="sonuc" title="Kısaca">{open.simple}</Callout> : <Callout tone="sonuc" title="Kısaca">{open.summary}</Callout>}
            {open.example ? <Callout tone="ornek" title={open.example.title}>{open.example.text}</Callout> : null}
            <Button type="link" href={`${KARAR_KITABI}#/model/${open.slug}/kavram`} target="_blank" rel="noreferrer" icon={<ArrowSquareOut size={18} />} style={{ padding: 0, justifySelf: 'start' }}>
              Karar Kitabı'nda aç
            </Button>
          </>
        ) : null}
      </Drawer>
    </div>
  )
}
