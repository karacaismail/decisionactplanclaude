import { readFileSync } from 'node:fs'
import ts from 'typescript'
import { DECISIONS, STRATEGY } from '../../src/data/decisions'
import { STEP_LIST } from '../../src/data/steps'
import { stepHeading } from '../../src/data/registry'
import { buildDemoPlan } from '../../src/data/demo'
import { clusterOf } from '../../src/data/clusters'

export interface AuditRoute {
  pattern: string
  path: string
  destination: string
  screen: string
  owner: string
}

const owners = new Map<string, string>(Object.entries({
  PlansScreen: 'İş 6', StartScreen: 'İş 6', OverviewScreen: 'İş 6',
  EvidenceScreen: 'İş 6', TasksScreen: 'İş 6', HistoryScreen: 'İş 6', InsightsScreen: 'İş 6',
  WorkRoute: 'İş 4', DecisionScreen: 'İş 5', ReviewScreen: 'İş 5',
  TransitionScreen: 'İş 5', StrategyScreen: 'İş 5', ExecutionScreen: 'İş 5',
  TakeoverScreen: 'İş 7', HandoffScreen: 'İş 7', OutputsScreen: 'İş 7',
  MethodsScreen: 'İş 7', FoundationScreen: 'İş 7', AssumptionsScreen: 'İş 7',
  Navigate: 'İş 1',
}))

// Adım numarası tek başına yeterli değildir. Karar ve adım birlikte doğrulanır.
const decisions = new Map([...DECISIONS, STRATEGY].map((decision) => [decision.n, decision]))
const steps = new Map(STEP_LIST.map((step) => [step.id, step]))
if (!DECISIONS.length || !STEP_LIST.length) throw new Error('Karar veya adım listesi boş.')
if (decisions.size !== DECISIONS.length + 1) throw new Error('Karar numarası tekrarlanıyor.')
if (steps.size !== STEP_LIST.length) throw new Error('Adım kimliği tekrarlanıyor.')
const declaredSteps = new Set<string>()
for (const decision of decisions.values()) {
  if (!Number.isInteger(decision.n) || decision.n < 1 || decision.gate.n !== decision.n) {
    throw new Error(`Karar ve kontrol numaraları geçersiz: ${decision.n}`)
  }
  for (const id of decision.steps) {
    if (declaredSteps.has(id) || steps.get(id)?.decision !== decision.n) {
      throw new Error(`Adımın karar kaydı geçersiz: ${decision.n}, ${id}`)
    }
    declaredSteps.add(id)
  }
}
for (const step of STEP_LIST) {
  if (!step.id || !declaredSteps.has(step.id) || !decisions.has(step.decision)) {
    throw new Error(`Adımın karar kaydı eksik: ${step.id}`)
  }
}

const source = ts.createSourceFile('routes.tsx', readFileSync('src/app/routes.tsx', 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)

type Element = ts.JsxElement | ts.JsxSelfClosingElement
type RouteDefinition = { pattern: string; screen: string; redirect?: string }
const definitions: RouteDefinition[] = []

function opening(node: Element) {
  return ts.isJsxElement(node) ? node.openingElement : node
}

function attributes(node: Element) {
  const result = new Map<string, ts.JsxAttribute>()
  for (const attribute of opening(node).attributes.properties) {
    if (!ts.isJsxAttribute(attribute)) throw new Error('Rota özellikleri açıkça yazılmalı.')
    const name = attribute.name.getText(source)
    if (result.has(name)) throw new Error(`Rota özelliği tekrarlanıyor: ${name}`)
    result.set(name, attribute)
  }
  return result
}

function unwrap(node: ts.Node): ts.Node {
  if (ts.isParenthesizedExpression(node)) return unwrap(node.expression)
  if (ts.isJsxExpression(node) && node.expression) return unwrap(node.expression)
  return node
}

function literal(attribute: ts.JsxAttribute | undefined, label: string): string {
  const value = attribute?.initializer && unwrap(attribute.initializer)
  if (value && (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value))) return value.text
  throw new Error(`Rota için sabit metin gerekiyor: ${label}`)
}

function children(node: ts.JsxElement | ts.JsxFragment): Element[] {
  return node.children.flatMap((child): Element[] => {
    if (ts.isJsxText(child) && !child.text.trim()) return []
    if (ts.isJsxExpression(child) && !child.expression) return []
    if (ts.isJsxFragment(child)) return children(child)
    const value = unwrap(child)
    if (ts.isJsxElement(value) || ts.isJsxSelfClosingElement(value)) return [value]
    throw new Error('Rota içeriği çözülemedi. Denetim listesi eksik kalabilir.')
  })
}

function routeElement(attribute: ts.JsxAttribute | undefined, pattern: string): Omit<RouteDefinition, 'pattern'> {
  const value = attribute?.initializer && unwrap(attribute.initializer)
  if (!value || (!ts.isJsxElement(value) && !ts.isJsxSelfClosingElement(value))) {
    throw new Error(`Rotanın ekranı çözülemedi: ${pattern}`)
  }
  let element = value
  // RequirePlan, örnek plan açıkken çocuğunu gösterir. Yeni sarmalayıcı açıkça tanımlanmalıdır.
  while (opening(element).tagName.getText(source) === 'RequirePlan') {
    if (attributes(element).size) throw new Error(`Plan koşulunun özellikleri değişti: ${pattern}`)
    const nested = ts.isJsxElement(element) ? children(element) : []
    if (nested.length !== 1) throw new Error(`Plan koşulunun ekranı belirsiz: ${pattern}`)
    element = nested[0]
  }
  const screen = opening(element).tagName.getText(source)
  if (!owners.has(screen)) throw new Error(`Ekranın iş sahibi tanımlı değil: ${screen}, ${pattern}`)
  const attrs = attributes(element)
  if (ts.isJsxElement(element) && children(element).length) {
    throw new Error(`Ekranın ek içeriği çözülemedi: ${screen}, ${pattern}`)
  }
  if (screen !== 'Navigate') return { screen }
  const redirect = literal(attrs.get('to'), `${pattern}, Navigate.to`)
  if (!redirect.startsWith('/') || /[:*?#]/.test(redirect)) {
    throw new Error(`Yönlendirme için açık bir uygulama yolu gerekiyor: ${pattern}`)
  }
  return { screen, redirect }
}

const LAYOUT_ROUTES = new Set(['AppShell', 'RouteContent'])

function collectRoutes(container: ts.JsxElement | ts.JsxFragment) {
  for (const route of children(container)) {
    if (opening(route).tagName.getText(source) !== 'Route') throw new Error('Routes içinde tanınmayan öğe var.')
    const attrs = attributes(route)
    // Component, loader veya lazy eklenirse eski liste doğru kabul edilmez.
    for (const name of attrs.keys()) {
      if (!['path', 'index', 'element'].includes(name)) throw new Error(`Rota özelliği desteklenmiyor: ${name}`)
    }
    const path = attrs.get('path')
    const index = attrs.get('index')
    if (!path && !index) {
      const shell = attrs.get('element')?.initializer
      const value = shell && unwrap(shell)
      // Yolu olmayan rota yalnız bilinen yerleşim sarmalayıcısı olabilir.
      // RouteContent, ekranı yüklenirken bekletir ve ekran hatasını yakalar. Adres eklemez.
      if (!ts.isJsxElement(route) || !value || !ts.isJsxSelfClosingElement(value)
        || !LAYOUT_ROUTES.has(value.tagName.getText(source)) || attributes(value).size) {
        throw new Error('Yolu olmayan rota için AppShell veya RouteContent bekleniyor.')
      }
      collectRoutes(route)
      continue
    }
    if (path && index) throw new Error('Bir rota hem path hem index içeremez.')
    if (index?.initializer && unwrap(index.initializer).kind !== ts.SyntaxKind.TrueKeyword) {
      throw new Error('Başlangıç rotasının index değeri çözülemedi.')
    }
    const pattern = index ? '/' : literal(path, 'path')
    if (pattern !== '*' && (!pattern.startsWith('/') || /[?#*]/.test(pattern))) {
      throw new Error(`Rota için tam yol ve açık örnek gerekiyor: ${pattern}`)
    }
    if (ts.isJsxElement(route) && children(route).length) {
      throw new Error(`İç içe rota için kapsam tanımlanmalı: ${pattern}`)
    }
    definitions.push({ pattern, ...routeElement(attrs.get('element'), pattern) })
  }
}

let routeTrees = 0
function visit(node: ts.Node) {
  if (ts.isJsxElement(node) && node.openingElement.tagName.getText(source) === 'Routes') {
    routeTrees++
    collectRoutes(node)
    return
  }
  ts.forEachChild(node, visit)
}
visit(source)
if (routeTrees !== 1 || !definitions.length) throw new Error('Tek ve dolu bir Routes ağacı bekleniyor.')

const patterns = new Set<string>()
const paths = new Set<string>()
export const auditRoutes: AuditRoute[] = definitions.flatMap(({ pattern, screen, redirect }) => {
  if (patterns.has(pattern)) throw new Error(`Rota kalıbı tekrarlanıyor: ${pattern}`)
  patterns.add(pattern)
  let examples: string[]
  if (pattern === '/karar/:n/adim/:id') examples = STEP_LIST.map((step) => `/karar/${step.decision}/adim/${encodeURIComponent(step.id)}`)
  else if (pattern === '/karar/:n' || pattern === '/karar/:n/kapi') examples = DECISIONS.map((decision) => pattern.replace(':n', String(decision.n)))
  else if (pattern.includes(':')) throw new Error(`Yeni rota için örnek değer gerekiyor: ${pattern}`)
  else examples = [pattern === '*' ? '/qa-bilinmeyen-rota' : pattern]
  const owner = owners.get(screen)
  if (!owner) throw new Error(`Ekranın iş sahibi tanımlı değil: ${screen}`)
  return examples.map((path) => {
    if (paths.has(path)) throw new Error(`Denetim yolu birden çok rotada geçiyor: ${path}`)
    paths.add(path)
    return { pattern, path, destination: redirect ?? path, screen, owner }
  })
})

// Bir rota ailesi kaynak dosyadan silinirse ilgili veri sessizce kapsam dışında kalmaz.
for (const pattern of ['/karar/:n', '/karar/:n/adim/:id', '/karar/:n/kapi', '*']) {
  if (!patterns.has(pattern)) throw new Error(`Zorunlu rota kalıbı eksik: ${pattern}`)
}
for (const route of auditRoutes.filter((entry) => entry.screen === 'Navigate')) {
  const visited = new Set([route.path])
  let target = auditRoutes.find((entry) => entry.path === route.destination)
  while (target?.screen === 'Navigate') {
    if (visited.has(target.path)) throw new Error(`Yönlendirme döngüsü var: ${route.path}`)
    visited.add(target.path)
    target = auditRoutes.find((entry) => entry.path === target?.destination)
  }
  if (!target) throw new Error(`Yönlendirme hedefi rota listesinde yok: ${route.path}`)
  route.destination = target.path
}

// Ekranların PageHeader.title değerleri. documentTitle, görünen h1 değildir.
const screenHeadings = new Map<string, string>(Object.entries({
  PlansScreen: 'Planlar',
  StartScreen: 'Bugün nereden başlayacaksınız?',
  OverviewScreen: buildDemoPlan().name,
  EvidenceScreen: 'Kanıtlar',
  TasksScreen: 'İşler',
  HistoryScreen: 'Geçmiş',
  InsightsScreen: 'Göstergeler',
  TakeoverScreen: 'Devralma girişi',
  HandoffScreen: 'Strateje teslim raporu',
  OutputsScreen: 'Çıktılar',
  MethodsScreen: 'Karar Kitabı',
  FoundationScreen: 'Strateji öncesi 20 temel soru',
  AssumptionsScreen: 'Varsayımlar',
  TransitionScreen: 'Stratejik planlamaya hazır mısınız?',
  StrategyScreen: STRATEGY.question,
  ExecutionScreen: clusterOf('uygulama').question,
}))

/** Örnek plan açıkken beklenen görünür h1 metnini döndürür. */
export function expectedHeading(route: AuditRoute): string {
  // auditRoutes, yönlendirme zincirlerini yukarıda son hedefe kadar çözer.
  const target = route.screen === 'Navigate'
    ? auditRoutes.find((entry) => entry.path === route.destination && entry.screen !== 'Navigate')
    : route
  if (!target) throw new Error(`Başlık için yönlendirme hedefi bulunamadı: ${route.path}`)
  if (target.screen === 'WorkRoute') {
    const step = STEP_LIST.find((entry) => target.path === `/karar/${entry.decision}/adim/${encodeURIComponent(entry.id)}`)
    if (!step) throw new Error(`Başlık için geçerli adım bulunamadı: ${target.path}`)
    return stepHeading(step.id)
  }
  if (target.screen === 'DecisionScreen' || target.screen === 'ReviewScreen') {
    const gate = target.screen === 'ReviewScreen'
    const decision = DECISIONS.find((entry) => target.path === `/karar/${entry.n}${gate ? '/kapi' : ''}`)
    if (!decision) throw new Error(`Başlık için geçerli karar bulunamadı: ${target.path}`)
    return gate ? `Kontrol ${decision.n}. ${decision.gate.title}` : decision.question
  }
  const heading = screenHeadings.get(target.screen)
  if (!heading) throw new Error(`Ekranın beklenen başlığı tanımlı değil: ${target.screen}`)
  return heading
}
