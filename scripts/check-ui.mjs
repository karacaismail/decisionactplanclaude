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
 *  (f) Gizlenen eylem yalnız hover ile açılmaz. Klavye ve dokunma yolu gerekir.
 *  (g) Kontrolün açık boyutları ve Button small kullanımı 44px alanı korur.
 *  (h) Yedeksiz her var(--x) kullanımının bir tanımı vardır. TypeScript tanımı her yerde
 *      geçerlidir: tokens.ts paleti, nesne anahtarı ya da setProperty('--x'). getPropertyValue
 *      okumadır, tanım sayılmaz. CSS tanımı yalnız dosyanın birlikte yüklendiği CSS'te geçerlidir.
 *      Dosya birden çok ekranda yükleniyorsa tanım her ekranın CSS'inde bulunmalıdır.
 *
 * Statik sınır: DOM ölçümü yapılmaz. Dinamik stiller, CSS-in-JS, karmaşık seçiciler,
 * örtüşme, padding ve taşan sözde öğelerin gerçek dokunma alanı tarayıcıda doğrulanır.
 * rem hesabı 16px kök varsayar. em, yüzde ve çözülemeyen ifadeler ölçülmüş sayılmaz.
 *
 * Komut: node scripts/check-ui.mjs [kök klasör]
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

export const MIN_FONT_PX = 14
export const MIN_HIT_AREA_PX = 44
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
    } else if (ch === ';') {
      // @import ve @charset sonraki seçicinin parçası değildir.
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
    rule.decls.push({ prop, value, important: /!important\s*$/i.test(part), line: lineOf(text, offset) })
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
export function checkCss(source, file, context) {
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
  const rules = parseCss(source)
  const scope = context ?? cssContext(rules)
  problems.push(...checkHover(rules, file, scope), ...checkCssTargets(rules, file, scope))
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
export function checkTsx(source, file, context) {
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
  problems.push(...checkJsxTargets(source, file, context ?? cssContext([])))
  return problems
}

const CONTROL_TAGS = new Set(['button', 'a', 'input', 'select', 'textarea', 'summary'])
const CONTROL_CLASSES = new Set(['button', 'btn', 'action', 'control', 'trigger', 'ant-btn', 'ant-input', 'ant-input-number', 'ant-select-selector', 'ant-picker', 'ant-switch', 'ant-menu-item', 'ant-radio-wrapper', 'ant-checkbox-wrapper', 'ant-segmented-item-label', 'ant-tabs-tab-btn', 'ant-collapse-header'])
const CONTROL_ROLES = new Set(['button', 'link', 'checkbox', 'radio', 'switch', 'tab', 'menuitem', 'option', 'combobox', 'slider', 'spinbutton', 'textbox'])
const STATES = /:(?:hover|focus-visible|focus-within|focus)\b/g

/** Virgülleri parantez ve tırnak dışında ayırır. */
function splitList(value) {
  const parts = []
  let depth = 0, quote = '', start = 0
  for (let i = 0; i < value.length; i += 1) {
    const c = value[i]
    if (quote) { if (c === quote && value[i - 1] !== '\\') quote = ''; continue }
    if (c === '"' || c === "'") quote = c
    else if (c === '(' || c === '[') depth += 1
    else if (c === ')' || c === ']') depth -= 1
    else if (c === ',' && depth === 0) { parts.push(value.slice(start, i).trim()); start = i + 1 }
  }
  return [...parts, value.slice(start).trim()].filter(Boolean)
}

function selectors(value) {
  return splitList(value).flatMap((selector) => {
    const group = /:(?:is|where)\(([^()]*)\)/.exec(selector)
    return group ? splitList(group[1]).flatMap((part) => selectors(selector.replace(group[0], part))) : [selector]
  })
}

function bare(selector) { return selector.replace(STATES, '').replace(/\s+/g, ' ').trim() }
function lastCompound(selector) { return selector.replace(/\[[^\]]*\]/g, (s) => s.replace(/\s/g, '')).split(/[\s>+~]+/).at(-1) }
function classes(selector) { return [...selector.matchAll(/\.([\w-]+)/g)].map((m) => m[1]) }

function isControl(selector, scope, decls = []) {
  if (/::|:before\b|:after\b/.test(selector)) return false
  const last = lastCompound(selector)
  const tag = /^[a-z][\w-]*/i.exec(last)?.[0]
  if (tag === 'svg' || tag === 'path') return false
  if (CONTROL_TAGS.has(tag)) return !/\[type=['"]?hidden['"]?\]/.test(last)
  const role = /\[role=['"]?([\w-]+)['"]?\]/.exec(last)?.[1]
  return CONTROL_ROLES.has(role) || classes(last).some((c) => CONTROL_CLASSES.has(c) || scope.controlClasses.has(c)) || decls.some((d) => d.prop === 'cursor' && d.value === 'pointer')
}

function cssContext(rules, controlClasses = new Set(), standalone = true) {
  const tokens = new Map(standalone ? [['--hit-area-min', '44px']] : [])
  const branches = rules.flatMap((rule) => splitList(rule.selector).flatMap((original) =>
    selectors(original).map((selector) => ({ ...rule, selector, rank: specificity(original) }))))
  return { rules, tokens, controlClasses, branches }
}

function lengthPx(value, scope, seen = new Set()) {
  if (/em$/.test(value) && !/rem$/.test(value)) return null
  const direct = pxValue(value)
  if (direct !== null) return direct
  const variable = /^var\(\s*(--[\w-]+)\s*(?:,\s*(.+))?\)$/.exec(value)
  if (variable) {
    if (seen.has(variable[1])) return null
    const resolved = scope.tokens.get(variable[1]) ?? variable[2]
    return resolved ? lengthPx(resolved, scope, new Set([...seen, variable[1]])) : null
  }
  const fn = /^(min|max|clamp)\((.*)\)$/.exec(value)
  if (!fn) return null
  const values = splitList(fn[2]).map((v) => lengthPx(v, scope, seen))
  if (fn[1] === 'clamp') return values[0] ?? null
  if (fn[1] === 'max') return values.some((v) => v !== null) ? Math.max(...values.filter((v) => v !== null)) : null
  return values.every((v) => v !== null) ? Math.min(...values) : null
}

function dimension(prop) {
  return prop.replace('inline-size', 'width').replace('block-size', 'height')
}

/** Basit seçicilerde kapsama. Bilinmeyen seçici bir ihlali susturamaz. */
function covers(base, target) {
  if (base === target) return true
  if (base === bare(base) && base === bare(target)) return true
  const pseudo = /::(?:before|after)$/
  if (pseudo.test(base) || pseudo.test(target)) {
    if (pseudo.exec(base)?.[0] !== pseudo.exec(target)?.[0]) return false
    return covers(base.replace(pseudo, ''), target.replace(pseudo, ''))
  }
  const attributes = (value) => [...value.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1].replace(/["'\s]/g, ''))
  const baseAttributes = attributes(base), targetAttributes = attributes(lastCompound(target))
  if (!baseAttributes.every((attr) => targetAttributes.some((actual) => attr === actual || (!attr.includes('=') && actual.startsWith(attr + '='))))) return false
  base = base.replace(/\[[^\]]*\]/g, '')
  if (/\s|[>+~:]/.test(base)) return false
  const last = lastCompound(target)
  const tag = /^[a-z][\w-]*/i.exec(base)?.[0]
  if (tag && tag !== /^[a-z][\w-]*/i.exec(last)?.[0]) return false
  const ids = [...base.matchAll(/#[\w-]+/g)].map((m) => m[0])
  const targetIds = [...last.matchAll(/#[\w-]+/g)].map((m) => m[0])
  return ids.every((id) => targetIds.includes(id)) && classes(base).every((c) => classes(last).includes(c))
}

function specificity(selector) {
  let rank = 0
  // :where() sıfırdır. :is(), :not() ve :has() en ağır dalı taşır.
  for (let match; (match = /:(where|is|not|has)\(/.exec(selector));) {
    const start = match.index + match[0].length
    let depth = 1, end = start
    for (; end < selector.length && depth; end += 1) {
      if (selector[end] === '(') depth += 1
      if (selector[end] === ')') depth -= 1
    }
    if (depth) return NaN // Bozuk seçici güvence vermez.
    if (match[1] !== 'where') rank += Math.max(...splitList(selector.slice(start, end - 1)).map(specificity))
    selector = selector.slice(0, match.index) + selector.slice(end)
  }
  for (const match of selector.matchAll(/#[\w-]+|\.[\w-]+|\[[^\]]+\]|::?[\w-]+|(?:^|[\s>+~])[a-z][\w-]*/gi)) {
    const token = match[0].trim()
    rank += token.startsWith('#') ? 10000 : token.startsWith('::') ? 1 : /^[.[:]/.test(token) ? 100 : 1
  }
  return rank
}

function effectiveDecls(target, atrules, scope, inline = []) {
  const found = new Map()
  const accept = (d, rank) => {
    const prop = dimension(d.prop)
    const priority = (d.important ? 1e9 : 0) + rank
    if (!found.has(prop) || found.get(prop).priority <= priority) found.set(prop, { ...d, priority })
  }
  scope.branches.forEach((rule) => {
    if (!Number.isFinite(rule.rank)) return
    if (rule.atrules.some((a) => !atrules.includes(a))) return
    if (covers(rule.selector, target)) for (const d of rule.decls) accept(d, rule.rank)
  })
  for (const d of inline) accept(d, 1e8)
  return found
}

function ancestors(target) {
  // Kardeş seçicilerinden miras çıkarılmaz. Bilinen üst öğeler sırayla işlenir.
  if (/[+~]/.test(target)) return []
  const parts = target.replace(/\[[^\]]*\]/g, (s) => s.replace(/\s/g, '')).split(/\s*>\s*|\s+/)
  return parts.slice(0, -1).map((_, i) => parts.slice(0, i + 1).join(' '))
}

/** Değişkenler tanımlandıkları öğede çözülür; hesaplanan değer miras alınır. */
function computedTokens(inherited, declarations) {
  const custom = [...declarations].filter(([prop]) => prop.startsWith('--'))
  const raw = new Map([...inherited, ...custom.map(([prop, d]) => [prop, /^(inherit|unset)$/.test(d.value) ? inherited.get(prop) ?? '__unresolved__' : d.value])])
  const computed = new Map(inherited)
  for (const [prop] of custom) {
    const value = lengthPx(raw.get(prop), { tokens: raw }, new Set([prop]))
    computed.set(prop, value === null ? '__unresolved__' : `${value}px`)
  }
  return computed
}

function targetScope(target, atrules, scope, inline = []) {
  let tokens = new Map(scope.tokens)
  for (const level of [':root', ...ancestors(target), target]) {
    tokens = computedTokens(tokens, effectiveDecls(level, atrules, scope, level === target ? inline : []))
  }
  return { ...scope, tokens }
}

/** Ölçüyü değiştiren yerel ve koşullu token tanımları ayrı durumda sınanır. */
function targetContexts(target, atrules, scope, inline = []) {
  const dependencies = new Set()
  const addDependencies = (value) => { for (const m of value.matchAll(/var\(\s*(--[\w-]+)/g)) dependencies.add(m[1]) }
  for (const [prop, d] of effectiveDecls(target, atrules, scope, inline)) if (/^(min-|max-)?(width|height)$/.test(prop)) addDependencies(d.value)
  for (const pseudo of ['::before', '::after']) for (const [prop, d] of effectiveDecls(target + pseudo, atrules, scope)) {
    if (/^(inset|top|right|bottom|left)$/.test(prop)) addDependencies(d.value)
  }
  for (let count = -1; count !== dependencies.size;) {
    count = dependencies.size
    for (const rule of scope.rules) for (const d of rule.decls) if (dependencies.has(d.prop)) addDependencies(d.value)
  }
  const contexts = new Map()
  const add = (selector, conditions) => {
    const unique = [...new Set(conditions)]
    contexts.set(JSON.stringify([selector, unique]), { selector, atrules: unique })
  }
  add(target, atrules)
  for (const rule of scope.branches) {
    if (!rule.decls.some((d) => dependencies.has(d.prop))) continue
    const conditions = [...atrules, ...rule.atrules]
    const selector = rule.selector.replace(/::(?:before|after)$/, '')
    if (selector === ':root' || covers(selector, target)) add(target, conditions)
    else if (covers(target, selector)) add(selector, conditions)
    else add(`${selector} ${target}`, conditions)
  }
  // Ayrı media koşulları aynı anda etkin olabilir. Tekil denetim yeterli değildir.
  const conditionSets = new Map([[JSON.stringify(atrules), atrules]])
  for (const context of contexts.values()) for (const active of [...conditionSets.values()]) {
    const combined = [...new Set([...active, ...context.atrules])].sort()
    conditionSets.set(JSON.stringify(combined), combined)
  }
  for (const context of [...contexts.values()]) for (const active of conditionSets.values()) add(context.selector, active)
  return [...contexts.values()]
}

/** Açık inset genişlemesi dışında sözde öğe geometrisi tahmin edilmez. */
function hitExpansion(target, atrules, scope, parent) {
  const extra = { width: 0, height: 0 }
  if (!/^(relative|absolute|fixed|sticky)$/.test(parent.get('position')?.value ?? '')) return extra
  if (['overflow', 'overflow-x', 'overflow-y'].some((p) => /hidden|clip/.test(parent.get(p)?.value ?? ''))) return extra
  // İnset alanı padding kutusuna bağlıdır. Bilinmeyen kenarlık ölçüsüyle alan garantisi verilmez.
  const borders = [...parent].filter(([prop]) => /^border(?:-(?:top|right|bottom|left))?(?:-width)?$/.test(prop))
  if (!borders.some(([prop, d]) => /^(border|border-width)$/.test(prop) && /^(0(?:px)?|none)$/.test(d.value)) || borders.some(([, d]) => !/^(0(?:px)?|none)$/.test(d.value))) return extra
  for (const pseudo of ['::before', '::after']) {
    const decls = effectiveDecls(target + pseudo, atrules, scope)
    const pseudoScope = { ...scope, tokens: computedTokens(scope.tokens, decls) }
    if (!/^(['"])\1$/.test(decls.get('content')?.value ?? '') || decls.get('position')?.value !== 'absolute' || decls.get('pointer-events')?.value === 'none') continue
    if (decls.get('display')?.value === 'none' || /^(hidden|collapse)$/.test(decls.get('visibility')?.value ?? '')) continue
    if (parent.get('pointer-events')?.value === 'none' && decls.get('pointer-events')?.value !== 'auto') continue
    if (decls.has('transform') && decls.get('transform').value !== 'none') continue
    const inset = (decls.get('inset')?.value ?? '').split(/\s+/)
    const [top, right = top, bottom = top, left = right] = inset
    const edges = { top, right, bottom, left }
    for (const edge of Object.keys(edges)) if (decls.has(edge)) edges[edge] = decls.get(edge).value
    for (const [axis, start, end] of [['width', 'left', 'right'], ['height', 'top', 'bottom']]) {
      if (decls.has(axis)) continue
      const from = lengthPx(edges[start] ?? '', pseudoScope), to = lengthPx(edges[end] ?? '', pseudoScope)
      if (from !== null && to !== null && from <= 0 && to <= 0) extra[axis] = Math.max(extra[axis], -from - to)
    }
  }
  return extra
}

function undersized(decls, scope, requireBoth = false, extra = { width: 0, height: 0 }) {
  const problems = []
  for (const axis of ['width', 'height']) {
    const size = decls.get(axis), min = decls.get(`min-${axis}`), max = decls.get(`max-${axis}`)
    const sizePx = size ? lengthPx(size.value, scope) : null
    const minPx = min ? lengthPx(min.value, scope) : null
    const maxPx = max ? lengthPx(max.value, scope) : null
    const unknownMax = max && maxPx === null && max.value !== 'none'
    const floor = Math.max(minPx ?? 0, unknownMax ? 0 : Math.min(sizePx ?? 0, maxPx ?? Infinity))
    if (floor + extra[axis] >= MIN_HIT_AREA_PX) continue
    if (minPx !== null && minPx >= MIN_HIT_AREA_PX) continue
    if (!unknownMax && sizePx !== null && sizePx >= MIN_HIT_AREA_PX && (maxPx === null || maxPx >= MIN_HIT_AREA_PX)) continue
    const small = (maxPx !== null && maxPx < MIN_HIT_AREA_PX && max) || (sizePx !== null && sizePx < MIN_HIT_AREA_PX && size) || (minPx !== null && minPx > 0 && minPx < MIN_HIT_AREA_PX && min)
    const unresolved = [size, min, max].find((d) => d && /var\(/.test(d.value) && lengthPx(d.value, scope) === null)
    if (small || unresolved || unknownMax || requireBoth) problems.push({ axis, decl: small || unresolved || (unknownMax && max) || min || size })
  }
  return problems
}

function checkCssTargets(rules, file, scope) {
  const problems = new Set()
  for (const rule of rules) {
    if (rule.atrules.some((a) => /@keyframes|@media\s+print\b/.test(a))) continue
    if (!rule.decls.some((d) => /^(min-|max-)?(width|height)$/.test(dimension(d.prop)))) continue
    for (const selector of selectors(rule.selector)) {
      if (!isControl(selector, scope, rule.decls)) continue
      for (const context of targetContexts(selector, rule.atrules, scope)) {
        const decls = effectiveDecls(context.selector, context.atrules, scope)
        const local = targetScope(context.selector, context.atrules, scope)
        for (const { axis, decl } of undersized(decls, local, false, hitExpansion(context.selector, context.atrules, local, decls))) {
          // İhlali yalnız incelenen kuralın kendi bildirimi üretir.
          if (decl?.file && decl.file !== file) continue
          if (!rule.decls.some((d) => d.line === decl?.line && d.prop === decl.prop && d.value === decl.value)) continue
          problems.add(`${file}:${decl.line} Dokunma alanı ${axis}: ${decl.value}. En az ${MIN_HIT_AREA_PX}px alanı koruyun.`)
        }
      }
    }
  }
  return [...problems]
}

function hidden(d) { return (d.prop === 'opacity' && Number(d.value) === 0) || (d.prop === 'display' && d.value === 'none') || (d.prop === 'visibility' && /^(hidden|collapse)$/.test(d.value)) }
function visible(d) { return (d.prop === 'opacity' && Number(d.value) > 0) || (d.prop === 'display' && !/^(none|var\(|inherit|unset)/.test(d.value)) || (d.prop === 'visibility' && d.value === 'visible') }
function touchQuery(a) { return /^@media\s+/i.test(a) && splitList(a.replace(/^@media\s+/i, '')).some((q) => /^\(\s*(?:any-)?(?:hover\s*:\s*none|pointer\s*:\s*coarse)\s*\)$/i.test(q)) }

function keyboardReachable(selector, target, atrules, scope) {
  // Saydam hedef Tab alabilir. Ancak üst öğesi odağı görünmez kılamaz.
  const visibleAncestors = ancestors(selector).every((ancestor) => {
    if (/\[inert(?:=|\])/.test(ancestor)) return false
    const initial = effectiveDecls(bare(ancestor), atrules, scope)
    if (initial.get('display')?.value === 'none' || /^(hidden|collapse)$/.test(initial.get('visibility')?.value ?? '')) return false
    const focused = effectiveDecls(ancestor, atrules, scope)
    return focused.get('display')?.value !== 'none' && !/^(hidden|collapse)$/.test(focused.get('visibility')?.value ?? '') && Number(focused.get('opacity')?.value) !== 0
  })
  if (!visibleAncestors) return false
  const baseline = effectiveDecls(target, atrules, scope)
  const blocksFocus = baseline.get('display')?.value === 'none' || /^(hidden|collapse)$/.test(baseline.get('visibility')?.value ?? '')
  if (!blocksFocus) return true // opacity: 0, Tab erişimini kaldırmaz.
  const focus = /^(.*?):focus(?:-visible|-within)?\b([^\s>+~]*)/.exec(selector)
  if (!focus) return false
  const trigger = bare(focus[1] + focus[2])
  if (trigger === target) return false
  const compound = lastCompound(trigger)
  const tag = /^[a-z][\w-]*/i.exec(compound)?.[0]
  if (/\[(?:disabled|inert)(?:=|\])|\[tabindex=['"]?-\d+['"]?\]|\[type=['"]?hidden['"]?\]/i.test(compound)) return false
  const tabIndex = /\[tabindex=['"]?(\d+)['"]?\]/i.test(compound)
  const focusable = tabIndex || ['button', 'input', 'select', 'textarea', 'summary'].includes(tag) || (tag === 'a' && /\[href(?:=|\])/.test(compound))
  if (!focusable) return false
  return [...ancestors(trigger), trigger].every((ancestor) => {
    if (/\[inert(?:=|\])/.test(ancestor)) return false
    const decls = effectiveDecls(ancestor, atrules, scope)
    return decls.get('display')?.value !== 'none' && !/^(hidden|collapse)$/.test(decls.get('visibility')?.value ?? '') && Number(decls.get('opacity')?.value) !== 0
  })
}

function checkHover(rules, file, scope) {
  const problems = new Set()
  const branches = scope.rules.flatMap((r) => selectors(r.selector).map((selector) => ({ ...r, selector })))
  for (const rule of rules) for (const selector of selectors(rule.selector)) {
    if (!/:hover\b/.test(selector) || /:not\(|:has\(/.test(selector)) continue
    if (!isControl(selector, scope) && !classes(lastCompound(selector)).some((c) => /(^|-)actions?$/.test(c))) continue
    const key = bare(selector)
    const hiddenRules = branches.filter((r) => !/:hover\b/.test(r.selector) && covers(bare(r.selector), key) && r.decls.some(hidden))
    for (const d of rule.decls.filter(visible)) {
      if (!hidden(effectiveDecls(key, rule.atrules, scope).get(d.prop) ?? {})) continue
      const hiddenForProp = hiddenRules.filter((r) => r.decls.some((v) => v.prop === d.prop && hidden(v)))
      if (!hiddenForProp.length) continue
      const alternatives = branches.filter((r) => covers(bare(r.selector), key) && !/:hover\b/.test(r.selector) && r.decls.some((v) => v.prop === d.prop && visible(v)) && visible(effectiveDecls(r.selector, r.atrules, scope).get(d.prop) ?? {}))
      const keyboard = alternatives.some((r) => /:focus(?:-visible|-within)?\b/.test(r.selector) && r.atrules.every((a) => rule.atrules.includes(a)) && keyboardReachable(r.selector, key, r.atrules, scope))
      const touch = alternatives.some((r) => !/:focus/.test(r.selector) && r.atrules.some(touchQuery) && r.atrules.every((a) => touchQuery(a) || rule.atrules.includes(a))) || (
        hiddenForProp.every((r) => r.atrules.some((a) => /^@media\s+\(hover\s*:\s*hover\)(?:\s+and\s+\(pointer\s*:\s*fine\))?$/.test(a))) &&
        alternatives.some((r) => !/:focus/.test(r.selector) && !r.atrules.length)
      )
      if (!keyboard || !touch) problems.add(`${file}:${d.line} Hover ile görünen eylem için ${[!keyboard && 'klavye', !touch && 'dokunma'].filter(Boolean).join(' ve ')} yolu eksik.`)
    }
  }
  return [...problems]
}

function jsxInfo(source, file) {
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const aliases = new Map([['Button', 'Button'], ['Popover', 'Popover'], ['Dropdown', 'Dropdown']])
  const imports = []
  const nodes = []
  const visit = (node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      if (node.importClause?.name) aliases.delete(node.importClause.name.text)
      const bindings = node.importClause?.namedBindings
      const onlyTypes = node.importClause?.isTypeOnly || (bindings && ts.isNamedImports(bindings) && bindings.elements.length > 0 && bindings.elements.every((item) => item.isTypeOnly) && !node.importClause?.name)
      if (!onlyTypes) imports.push(node.moduleSpecifier.text)
      if (bindings && ts.isNamedImports(bindings)) {
        for (const item of bindings.elements) {
          const imported = item.propertyName?.text ?? item.name.text
          if (node.moduleSpecifier.text === 'antd') aliases.set(item.name.text, imported)
          else aliases.delete(item.name.text)
        }
      }
    }
    if (ts.isExportDeclaration(node) && !node.isTypeOnly && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) imports.push(node.moduleSpecifier.text)
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) nodes.push(node)
    ts.forEachChild(node, visit)
  }
  visit(ast)
  return { ast, aliases, imports, nodes }
}

function literal(node) {
  if (!node) return undefined
  if (ts.isJsxExpression(node) || ts.isParenthesizedExpression(node) || ts.isAsExpression(node)) return literal(node.expression)
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text
  if (ts.isNumericLiteral(node)) return node.text
  if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(node.operand)) return '-' + node.operand.text
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(literal)
  return undefined
}

function jsxAttributes(node) {
  return new Map(node.attributes.properties.filter(ts.isJsxAttribute).map((a) => [a.name.getText(), a.initializer]))
}

function jsxTarget(node, info) {
  const attrs = jsxAttributes(node)
  const name = node.tagName.getText(info.ast)
  const component = info.aliases.get(name)
  const native = CONTROL_TAGS.has(name) && !(name === 'input' && literal(attrs.get('type')) === 'hidden')
  const interactive = native || component === 'Button' || CONTROL_ROLES.has(literal(attrs.get('role'))) || attrs.has('onClick')
  const className = literal(attrs.get('className'))
  const names = typeof className === 'string' ? className.split(/\s+/).filter(Boolean) : []
  if (component === 'Button') names.push('ant-btn')
  return { attrs, component, interactive, names, selector: (native ? name : '') + names.map((c) => '.' + c).join('') }
}

function checkJsxTargets(source, file, scope) {
  const info = jsxInfo(source, file)
  const problems = []
  for (const node of info.nodes) {
    const { attrs, component, interactive, selector } = jsxTarget(node, info)
    const line = lineOf(source, node.getStart(info.ast))
    if (component === 'Popover' || component === 'Dropdown') {
      const trigger = literal(attrs.get('trigger'))
      const triggers = Array.isArray(trigger) ? trigger : [trigger ?? (!attrs.has('trigger') ? 'hover' : undefined)]
      if (triggers.includes('hover') && !triggers.includes('click')) problems.push(`${file}:${line} Hover ile açılan ${component} için dokunma yolu eksik. click tetikleyicisi ekleyin.`)
    }
    if (!interactive) continue
    const style = attrs.get('style')
    const object = style && ts.isJsxExpression(style) ? style.expression : undefined
    const decls = []
    if (object && ts.isObjectLiteralExpression(object)) {
      for (const prop of object.properties) {
        if (!ts.isPropertyAssignment(prop)) continue
        const name = prop.name.getText(info.ast).replace(/['"]/g, '')
        const value = literal(prop.initializer)
        if (typeof value !== 'string' && !name.startsWith('--')) continue
        decls.push({ prop: name.startsWith('--') ? name : name.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()), value: value ?? '__unresolved__', line: lineOf(source, prop.getStart(info.ast)) })
      }
    }
    const small = component === 'Button' && literal(attrs.get('size')) === 'small'
    const reported = new Set()
    for (const context of targetContexts(selector, [], scope, decls)) {
      const effective = effectiveDecls(context.selector, context.atrules, scope, decls)
      const local = targetScope(context.selector, context.atrules, scope, decls)
      for (const { axis, decl } of undersized(effective, local, small, hitExpansion(context.selector, context.atrules, local, effective))) {
        reported.add(`${file}:${decl?.file ? line : decl?.line ?? line} Dokunma alanı ${axis} için ${MIN_HIT_AREA_PX}px sınırı doğrulanamıyor.${small ? ' Button small için iki boyutu da koruyun.' : ''}`)
      }
    }
    problems.push(...reported)
  }
  return problems
}

const CUSTOM_PROPERTY_DECL = /(?:^|[;{\s])(--[a-zA-Z0-9_-]+)\s*:/g
const CUSTOM_PROPERTY_NAME = /(['"`])(--[a-zA-Z0-9_-]+)\1/g
const PALETTE_BLOCK = /export\s+const\s+(?:light|dark)\s*=\s*\{([\s\S]*?)\}\s*as\s+const/g
/* Yedeği olmayan var(--x) kullanımı. Yedekli kullanım bilinçli bir seçimdir. */
const VAR_WITHOUT_FALLBACK = /var\(\s*(--[a-zA-Z0-9_-]+)\s*\)/g

/** TypeScript yorumlarını boşlukla değiştirir. Satır numaraları ve dizeler korunur. */
function stripTsComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).replace(/(^|[^:'"`\\])\/\/[^\n]*/g, (m, pre) => pre + ' '.repeat(m.length - pre.length))
}

/* Değeri okuyan ya da silen çağrı tanım değildir. Örneğin getPropertyValue('--x'). */
const PROPERTY_READ = /(?:getPropertyValue|removeProperty)\(\s*$/

/** Bir dosyanın tanımladığı CSS değişkeni adlarını döndürür. */
function definitionsOf(file, source) {
  const names = new Set()
  if (file.endsWith('.css')) {
    for (const m of stripComments(source).matchAll(CUSTOM_PROPERTY_DECL)) names.add(m[1])
    return names
  }
  const text = stripTsComments(source)
  for (const m of text.matchAll(CUSTOM_PROPERTY_NAME)) {
    if (!PROPERTY_READ.test(text.slice(Math.max(0, m.index - 40), m.index))) names.add(m[2])
  }
  for (const block of text.matchAll(PALETTE_BLOCK)) {
    for (const key of block[1].matchAll(/^\s*([a-zA-Z0-9]+)\s*:/gm)) {
      names.add(`--color-${key[1].replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`)
    }
  }
  return names
}

/**
 * (h) Tanımsız CSS değişkeni. files: { file, source } listesi.
 * TypeScript tanımları çalışma anında html öğesine yazılır. Bu yüzden her dosyada geçerlidir.
 * CSS tanımları yalnız birlikte yüklenen dosyalarda geçerlidir.
 * options.contextsFor(file), dosyanın yüklendiği her ekranın CSS listesini verir.
 * Değişken bu listelerin hepsinde tanımlı olmalıdır. Verilmezse bütün CSS tek liste sayılır.
 */
export function checkCustomProperties(files, options = {}) {
  const runtime = new Set()
  const cssDefs = new Map()
  for (const { file, source } of files) {
    const names = definitionsOf(file, source)
    if (file.endsWith('.css')) cssDefs.set(file, names)
    else for (const name of names) runtime.add(name)
  }
  const allCss = [...cssDefs.keys()]
  const problems = []
  for (const { file, source } of files) {
    const contexts = (options.contextsFor ? options.contextsFor(file) : [allCss]).map((list) => {
      const names = new Set()
      for (const css of list) for (const name of cssDefs.get(css) ?? []) names.add(name)
      return names
    })
    const defined = (name) => runtime.has(name) || (contexts.length > 0 && contexts.every((names) => names.has(name)))
    const text = file.endsWith('.css') ? stripComments(source) : stripTsComments(source)
    for (const m of text.matchAll(VAR_WITHOUT_FALLBACK)) {
      if (!defined(m[1])) problems.push(`${file}:${lineOf(text, m.index)} ${m[1]} tanımsız CSS değişkeni. Tokenı tanımlayın ya da var içinde yedek değer verin.`)
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
  const sources = new Map(walk(srcDir).map((file) => [resolve(file), readFileSync(file, 'utf8')]))
  const controlClasses = new Set()
  const imports = new Map()
  for (const [file, source] of sources) {
    if (file.endsWith('.css')) {
      imports.set(file, [...stripComments(source).matchAll(/@import\s+(?:url\(\s*)?['"]([^'"]+)['"]/g)].map((m) => m[1]))
    } else {
      const info = jsxInfo(source, file)
      imports.set(file, info.imports)
      for (const node of info.nodes) {
        const target = jsxTarget(node, info)
        if (target.interactive) for (const name of target.names) controlClasses.add(name)
      }
    }
  }
  const resolveImport = (from, specifier) => {
    if (!specifier.startsWith('.') && !specifier.startsWith('@/')) return null
    const base = specifier.startsWith('@/') ? resolve(srcDir, specifier.slice(2)) : resolve(dirname(from), specifier)
    return [base, base + '.tsx', base + '.ts', join(base, 'index.tsx'), join(base, 'index.ts')].find((candidate) => sources.has(candidate)) ?? null
  }
  const loadedCss = (entry) => {
    const visited = new Set(), ordered = []
    const visit = (file) => {
      if (!sources.has(file) || visited.has(file)) return
      visited.add(file)
      for (const specifier of imports.get(file) ?? []) {
        const dependency = resolveImport(file, specifier)
        if (dependency) visit(dependency)
      }
      if (file.endsWith('.css')) ordered.push(file)
    }
    visit(entry)
    return ordered
  }
  const globalCss = loadedCss(resolve(srcDir, 'main.tsx'))
  const ruleCache = new Map()
  for (const [file, source] of sources) if (file.endsWith('.css')) {
    const rel = relative(root, file).split('\\').join('/')
    ruleCache.set(file, parseCss(source).map((rule) => ({ ...rule, decls: rule.decls.map((d) => ({ ...d, file: rel })) })))
  }
  const problems = []
  for (const [file, body] of sources) {
    const rel = relative(root, file).split('\\').join('/')
    if (IGNORED.has(rel)) continue
    const cssFiles = [...new Set([...globalCss, ...loadedCss(file)])]
    const context = cssContext(cssFiles.flatMap((path) => ruleCache.get(path) ?? []), controlClasses, false)
    problems.push(...(file.endsWith('.css') ? checkCss(body, rel, context) : checkTsx(body, rel, context)))
  }
  const relOf = (file) => relative(root, file).split('\\').join('/')
  // Kök dosyayı başka kaynak statik olarak içe aktarmaz. Örneğin main.tsx ve geç yüklenen ekranlar köktür.
  const imported = new Set()
  for (const [file] of sources) for (const specifier of imports.get(file) ?? []) {
    const dependency = resolveImport(file, specifier)
    if (dependency) imported.add(dependency)
  }
  const closureOf = (entry) => {
    const seen = new Set()
    const visit = (file) => {
      if (!sources.has(file) || seen.has(file)) return
      seen.add(file)
      for (const specifier of imports.get(file) ?? []) { const dependency = resolveImport(file, specifier); if (dependency) visit(dependency) }
    }
    visit(entry)
    return seen
  }
  const roots = [...sources.keys()].filter((file) => !imported.has(file)).map((root) => ({ closure: closureOf(root), css: [...new Set([...globalCss, ...loadedCss(root)])].map(relOf) }))
  const contextsFor = new Map([...sources.keys()].map((file) => {
    const owners = roots.filter((root) => root.closure.has(file)).map((root) => root.css)
    return [relOf(file), owners.length ? owners : [[...new Set([...globalCss, ...loadedCss(file)])].map(relOf)]]
  }))
  problems.push(...checkCustomProperties([...sources].map(([file, source]) => ({ file: relOf(file), source })), { contextsFor: (file) => contextsFor.get(file) ?? [] }))
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
    console.log('Arayüz kapısı temiz. Yazı, hareket, odak, kenar, cihaz, hover, dokunma ve CSS değişkeni kaynak kuralları geçti. Gerçek alan ölçümü tarayıcıda yapılmalı.')
  }
}
