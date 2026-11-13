#!/usr/bin/env node
/**
 * Arayüz kalite kapısı.
 *
 * `src` altındaki .css, .ts ve .tsx dosyalarını tarar. İhlal bulursa
 * "dosya:satır Açıklama" biçiminde yazar ve çıkış kodu 1 verir.
 *
 * Denetlenen kurallar:
 *  (a) 14 pikselin altında yazı boyutu yok.
 *  (b) Hareket süreleri ve eğrileri ortak değişkenden gelir. `transition: all` yok.
 *      prefers-reduced-motion bloğu bu kuraldan muaftır.
 *  (c) Çevreleyen odak halkası yok. Odak kuralında outline ve box-shadow kullanılmaz.
 *      forced-colors bloğu bu kuraldan muaftır.
 *  (d) Kavisli vurgu kenarı yok. Aynı blokta tek kenar çizgisi ile köşe yuvarlatma olamaz.
 *  (e) Davranış `isMobile` bayrağı veya userAgent ile seçilmez.
 *
 * Komut: node scripts/check-ui.mjs [kök klasör]
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const MIN_FONT_PX = 14
const MOTION_VAR = /var\(--motion-[a-z0-9-]+\)/i
const RAW_DURATION = /(^|[\s,(])\d*\.?\d+m?s\b/i
const RAW_EASING = /\b(cubic-bezier|steps|linear|ease(-in|-out|-in-out)?)\b/i
const SIDE_BORDER_CSS = /^border-(left|right|top|bottom)(-color)?$/
const SIDE_BORDER_TSX = /\bborder(Left|Right|Top|Bottom)(Color)?\s*:\s*(['"`])((?:(?!\3).)*)\3/g
const DEVICE_FLAG = /\bisMobile\b|navigator\.userAgent|\buserAgent\b/

/** Yoksayılan dosyalar. Token kaynağı ham değer taşır; başka yerde kullanılmaz. */
const IGNORED = new Set(['src/theme/tokens.ts'])

function lineOf(text, index) {
  let line = 1
  for (let i = 0; i < index && i < text.length; i += 1) if (text.charCodeAt(i) === 10) line += 1
  return line
}

function stripComments(text) {
  // Yorumları boşlukla değiştir; satır numaraları korunur.
  return text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
}

/**
 * Küçük CSS çözümleyici. Kuralları {selector, atrules[], decls[]} olarak döndürür.
 * İç içe at-kuralları (media, supports) destekler.
 */
export function parseCss(source) {
  const text = stripComments(source)
  const rules = []
  const stack = []
  let buffer = ''
  let bufferStart = 0
  let current = null
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]
    if (ch === '{') {
      const prelude = buffer.trim()
      buffer = ''
      if (prelude.startsWith('@')) {
        stack.push({ kind: 'at', prelude })
        current = null
      } else {
        const rule = { selector: prelude, line: lineOf(text, bufferStart), atrules: stack.filter((s) => s.kind === 'at').map((s) => s.prelude), decls: [] }
        rules.push(rule)
        stack.push({ kind: 'rule', rule })
        current = rule
      }
      bufferStart = i + 1
    } else if (ch === '}') {
      if (current && buffer.trim()) pushDecls(current, buffer, bufferStart, text)
      buffer = ''
      stack.pop()
      const top = stack[stack.length - 1]
      current = top && top.kind === 'rule' ? top.rule : null
      bufferStart = i + 1
    } else if (ch === ';' && current) {
      buffer += ch
      pushDecls(current, buffer, bufferStart, text)
      buffer = ''
      bufferStart = i + 1
    } else {
      if (!buffer.trim() && !/\s/.test(ch)) bufferStart = i
      buffer += ch
    }
  }
  return rules
}

function pushDecls(rule, chunk, chunkStart, text) {
  for (const part of chunk.split(';')) {
    const colon = part.indexOf(':')
    if (colon < 0) continue
    const prop = part.slice(0, colon).trim().toLowerCase()
    const value = part.slice(colon + 1).trim().replace(/\s*!important\s*$/i, '')
    if (!prop) continue
    const offset = chunkStart + chunk.indexOf(part)
    rule.decls.push({ prop, value, line: lineOf(text, offset) })
  }
}

function pxValue(value) {
  const m = /^(-?\d*\.?\d+)(px|rem|em)?$/.exec(value.trim())
  if (!m) return null
  const n = parseFloat(m[1])
  if (m[2] === 'rem' || m[2] === 'em') return n * 16
  if (m[2] === 'px' || !m[2]) return n
  return null
}

function isZeroOrNone(value) {
  const v = value.trim().toLowerCase()
  return v === 'none' || v === '0' || v === '0px' || v === 'transparent' || v === 'unset' || v === 'initial' || v === 'inherit'
}

function sideBorderDraws(value) {
  const v = value.trim().toLowerCase()
  if (isZeroOrNone(v)) return false
  if (/(^|\s)0(px)?(\s|$)/.test(v) && !/\b[1-9]\d*(\.\d+)?px\b/.test(v)) return false
  return true
}

/** CSS dosyasını denetler ve ihlal listesini döndürür. */
export function checkCss(source, file) {
  const problems = []
  const report = (line, msg) => problems.push(`${file}:${line} ${msg}`)
  for (const rule of parseCss(source)) {
    const inReducedMotion = rule.atrules.some((a) => /prefers-reduced-motion/i.test(a))
    const inForcedColors = rule.atrules.some((a) => /forced-colors\s*:\s*active/i.test(a))
    const focusRule = /:focus(-visible|-within)?\b/i.test(rule.selector)
    let sideBorder = null
    let radius = null
    for (const d of rule.decls) {
      // (a) Yazı boyutu
      if (d.prop === 'font-size') {
        const px = pxValue(d.value)
        if (px !== null && px < MIN_FONT_PX) report(d.line, `Yazı boyutu ${d.value}. En az ${MIN_FONT_PX}px olmalı.`)
        const clampMin = /clamp\(\s*([^,]+),/i.exec(d.value)
        if (clampMin) {
          const minPx = pxValue(clampMin[1])
          if (minPx !== null && minPx < MIN_FONT_PX) report(d.line, `clamp alt sınırı ${clampMin[1].trim()}. En az ${MIN_FONT_PX}px olmalı.`)
        }
      }
      // (b) Hareket
      if (/^(transition|animation)(-duration|-timing-function|-delay)?$/.test(d.prop) && !inReducedMotion) {
        if (/^(transition|animation)$/.test(d.prop) && /(^|[\s,])all(\s|,|$)/i.test(d.value)) report(d.line, 'transition: all yasak. Değişen özelliği tek tek yazın.')
        if (!isZeroOrNone(d.value) && !MOTION_VAR.test(d.value) && (RAW_DURATION.test(d.value) || RAW_EASING.test(d.value))) {
          report(d.line, `Hareket değeri "${d.value}" ortak değişken kullanmıyor. var(--motion-...) kullanın.`)
        }
      }
      // (c) Odak halkası
      if (focusRule && !inForcedColors) {
        if (/^outline(-width|-style|-color)?$/.test(d.prop) && !isZeroOrNone(d.value) && d.value.trim() !== '0px') {
          report(d.line, `Odak kuralında outline "${d.value}" var. Çevreleyen odak halkası yasak.`)
        }
        if (d.prop === 'box-shadow' && !isZeroOrNone(d.value)) report(d.line, `Odak kuralında box-shadow "${d.value}" var. Gölgeyle odak halkası yasak.`)
      }
      // (d) Kavisli vurgu kenarı
      if (SIDE_BORDER_CSS.test(d.prop) && sideBorderDraws(d.value)) sideBorder = d
      if (/^border(-top|-bottom)?(-left|-right)?-radius$/.test(d.prop) && !isZeroOrNone(d.value)) radius = d
    }
    if (sideBorder && radius) {
      report(sideBorder.line, `Tek kenar çizgisi (${sideBorder.prop}) ile köşe yuvarlatma (satır ${radius.line}) aynı blokta. Kavisli vurgu kenarı yasak.`)
    }
  }
  return problems
}

function findEnclosingObject(text, index) {
  // index konumunu kapsayan en yakın { ... } nesnesini bulur.
  let depth = 0
  let start = -1
  for (let i = index; i >= 0; i -= 1) {
    const ch = text[i]
    if (ch === '}') depth += 1
    else if (ch === '{') {
      if (depth === 0) { start = i; break }
      depth -= 1
    }
  }
  if (start < 0) return null
  depth = 0
  for (let i = start; i < text.length; i += 1) {
    const ch = text[i]
    if (ch === '{') depth += 1
    else if (ch === '}') {
      depth -= 1
      if (depth === 0) return text.slice(start, i + 1)
    }
  }
  return null
}

/** .ts ve .tsx kaynağını denetler ve ihlal listesini döndürür. */
export function checkTsx(source, file) {
  const problems = []
  const text = source.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).replace(/(^|[^:'"`])\/\/[^\n]*/g, (m, pre) => pre + ' '.repeat(m.length - pre.length))
  const report = (index, msg) => problems.push(`${file}:${lineOf(text, index)} ${msg}`)
  const isTsx = file.endsWith('.tsx')

  // (e) Cihaz bayrağı: .ts ve .tsx için geçerli.
  for (const m of text.matchAll(new RegExp(DEVICE_FLAG.source, 'g'))) {
    report(m.index, `"${m[0]}" ile davranış seçilmez. Yerleşim alanını, giriş türünü ve hover desteğini ayrı ayrı sorgulayın.`)
  }
  if (!isTsx) return problems

  // (a) Satır içi yazı boyutu
  for (const m of text.matchAll(/\bfontSize\s*[:=]\s*\{?\s*(['"`]?)(-?\d*\.?\d+)(px|rem|em)?\1/g)) {
    const px = pxValue(m[2] + (m[3] ?? ''))
    if (px !== null && px < MIN_FONT_PX) report(m.index, `Yazı boyutu ${m[2]}${m[3] ?? 'px'}. En az ${MIN_FONT_PX}px olmalı.`)
  }

  // (b) Satır içi hareket
  for (const m of text.matchAll(/\b(transition|animation)\s*:\s*(['"`])((?:(?!\2).)*)\2/g)) {
    const value = m[3]
    if (/(^|[\s,])all(\s|,|$)/i.test(value)) report(m.index, 'transition: all yasak. Değişen özelliği tek tek yazın.')
    if (!isZeroOrNone(value) && !MOTION_VAR.test(value) && (RAW_DURATION.test(value) || RAW_EASING.test(value))) {
      report(m.index, `Hareket değeri "${value}" ortak değişken kullanmıyor. var(--motion-...) veya motion tokenı kullanın.`)
    }
  }
  // ECharts'ın adlı eğrisi (animationEasing) CSS tokenına çevrilemez; yalnız süre ve CSS eğrisi denetlenir.
  for (const m of text.matchAll(/\b(transition|animation)(Duration|TimingFunction|Delay)\s*:\s*([^,\n}]+)/g)) {
    const value = m[3].trim()
    const usesToken = /\bmotion\.|token\.motion|var\(--motion-/.test(value)
    const literal = /^(['"`]).*\1$/.test(value) || /^-?\d*\.?\d+$/.test(value)
    if (!usesToken && literal) report(m.index, `${m[1]}${m[2]}: ${value} ham değer. motion tokenını kullanın.`)
  }

  // (c) Satır içi odak halkası
  for (const m of text.matchAll(/\boutline(Width|Style)?\s*:\s*(['"`])((?:(?!\2).)*)\2/g)) {
    if (!isZeroOrNone(m[3])) report(m.index, `Satır içi outline "${m[3]}". Çevreleyen odak halkası yasak.`)
  }
  for (const m of text.matchAll(/\boutline(Width)?\s*:\s*(\d*\.?\d+)\b/g)) {
    if (parseFloat(m[2]) > 0) report(m.index, `Satır içi outline ${m[2]}. Çevreleyen odak halkası yasak.`)
  }

  // (d) Satır içi kavisli vurgu kenarı
  for (const m of text.matchAll(SIDE_BORDER_TSX)) {
    if (!sideBorderDraws(m[4])) continue
    const obj = findEnclosingObject(text, m.index)
    if (!obj) continue
    const radius = /\bborderRadius\s*:\s*([^,\n}]+)/.exec(obj)
    if (radius && !isZeroOrNone(radius[1]) && radius[1].trim() !== '0') {
      report(m.index, `border${m[1]} ile borderRadius (${radius[1].trim()}) aynı nesnede. Kavisli vurgu kenarı yasak.`)
    }
  }
  return problems
}

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else if (/\.(css|ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name) && !name.endsWith('.d.ts')) out.push(full)
  }
  return out
}

/** Bir kök klasörün altındaki src dizinini denetler. */
export function checkProject(root) {
  const srcDir = join(root, 'src')
  const problems = []
  for (const file of walk(srcDir)) {
    const rel = relative(root, file).split('\\').join('/')
    if (IGNORED.has(rel)) continue
    const body = readFileSync(file, 'utf8')
    problems.push(...(file.endsWith('.css') ? checkCss(body, rel) : checkTsx(body, rel)))
  }
  return problems
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const root = resolve(process.argv[2] ?? process.cwd())
  const problems = checkProject(root)
  if (problems.length) {
    console.error(`Arayüz kapısı ${problems.length} ihlal buldu:`)
    for (const p of problems) console.error('  ' + p)
    process.exitCode = 1
  } else {
    console.log('Arayüz kapısı temiz. Yazı boyutu, hareket, odak, kenar ve cihaz bayrağı kuralları geçti.')
  }
}
