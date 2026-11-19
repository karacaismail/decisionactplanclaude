import { describe, expect, it } from 'vitest'
// @ts-expect-error JavaScript modülü, tip bildirimi yok.
import { checkModuleBoundaries } from './check-module-boundaries.mjs'

/* Kapıya sahte bir proje verilir. Anahtar dosya yolu, değer dosya içeriğidir. */
function check(files: Record<string, string>) {
  return checkModuleBoundaries(new Map(Object.entries(files))) as string[]
}

const valid = {
  'src/data/types.ts': 'export interface PlanDoc { id: string }',
  'src/engine/strategy.ts': "import type { PlanDoc } from '@/data/types'\nexport const movesOf = (p: PlanDoc) => p",
  'src/store/planStore.ts': "import { notifyPlanDeleted } from '@/platform/lifecycle'",
  'src/app/AppShell.tsx': "import { MODULE_NAV } from '@/platform/modules'",
  'src/contracts/index.ts': "import type { PlanDoc } from '@/data/types'\nimport { movesOf } from '@/engine/strategy'\nexport type { PlanDoc }",
  'src/platform/modules.ts': "import type { ModuleManifest } from './types'\nconst found = import.meta.glob('../modules/*/manifest.ts', { eager: true })",
  'src/platform/types.ts': "import type { ComponentType } from 'react'\nimport type { ReadonlyPlan } from '@/contracts'",
  'src/platform/lifecycle.ts': "import { MODULES } from './modules'",
  'src/modules/proje/manifest.ts': "import type { ModuleManifest } from '@/platform/types'\nconst m: ModuleManifest = { routes: [{ load: () => import('./screens/PjListeScreen') }], lifecycle: () => import('./lifecycle') }\nexport default m",
  'src/modules/proje/lifecycle.ts': "import { createPlanScopedLifecycle } from '@/platform/planScoped'\nexport default createPlanScopedLifecycle('proje', 1)",
  'src/modules/proje/screens/PjListeScreen.tsx': "import '@/styles/ekran/PjListeScreen.css'\nimport { Button } from 'antd'\nimport { EmptyState } from '@/components/EmptyState'\nimport { selectPlanSummary } from '@/contracts'\nimport { useCurrentPlanView } from '@/platform/planSource'\nimport { tokens } from '@/theme/tokens'\nimport { x } from '../model'\nconst chart = () => import('echarts')",
  'src/modules/proje/model.ts': 'export const x = 1',
}

describe('modül sınır kapısı', () => {
  it('düzenli projede hata bulmaz', () => {
    expect(check(valid)).toEqual([])
  })

  it('modülün çekirdek dosyasını içe aktarmasını bulur', () => {
    const errors = check({ ...valid, 'src/modules/proje/model.ts': "import { usePlanStore } from '@/store/planStore'\nimport { gatePassed } from '../../engine/gate'" })
    expect(errors.join('\n')).toMatch(/proje\/model\.ts.*@\/store\/planStore/)
    expect(errors.join('\n')).toMatch(/proje\/model\.ts.*engine\/gate/)
  })

  it('modülün başka modülü içe aktarmasını bulur', () => {
    const errors = check({ ...valid, 'src/modules/destek/a.ts': "import { x } from '@/modules/proje/model'" })
    expect(errors.join('\n')).toMatch(/destek\/a\.ts.*modules\/proje/)
  })

  it('grafik paketini durağan içe aktaran modülü bulur', () => {
    const errors = check({ ...valid, 'src/modules/proje/model.ts': "import * as echarts from 'echarts'\nimport 'zrender'" })
    expect(errors.join('\n')).toMatch(/echarts.*dinamik/)
    expect(errors.join('\n')).toMatch(/zrender.*dinamik/)
  })

  it('bildirim dosyasında React ve durağan değer içe aktarmasını bulur', () => {
    const errors = check({ ...valid, 'src/modules/proje/manifest.ts': "import { useState } from 'react'\nimport { x } from './model'\nexport default {}" })
    expect(errors.join('\n')).toMatch(/manifest\.ts.*react/)
    expect(errors.join('\n')).toMatch(/manifest\.ts.*\.\/model/)
  })

  it('çekirdeğin modül içe aktarmasını bulur', () => {
    const errors = check({ ...valid, 'src/screens/X.tsx': "import { x } from '@/modules/proje/model'\nconst s = () => import('../modules/proje/screens/PjListeScreen')" })
    expect(errors.join('\n')).toMatch(/screens\/X\.tsx.*@\/modules\/proje\/model/)
    expect(errors.join('\n')).toMatch(/screens\/X\.tsx.*PjListeScreen/)
  })

  it('modül klasörünü tarayan başka glob çağrısını bulur', () => {
    const errors = check({ ...valid, 'src/app/x.ts': "const all = import.meta.glob('../modules/**/*.tsx')" })
    expect(errors.join('\n')).toMatch(/app\/x\.ts.*glob/)
  })

  it('sözleşme katmanının izinsiz içe aktarmasını bulur', () => {
    const errors = check({ ...valid, 'src/contracts/index.ts': "import { usePlanStore } from '@/store/planStore'\nimport { Button } from 'antd'" })
    expect(errors.join('\n')).toMatch(/contracts\/index\.ts.*@\/store\/planStore/)
    expect(errors.join('\n')).toMatch(/contracts\/index\.ts.*antd/)
  })

  it('altyapının çekirdek ya da modül içe aktarmasını bulur', () => {
    const errors = check({ ...valid, 'src/platform/x.ts': "import { usePlanStore } from '@/store/planStore'\nimport { x } from '@/modules/proje/model'\nimport { selectPlanSummary } from '@/contracts'" })
    expect(errors.join('\n')).toMatch(/platform\/x\.ts.*@\/store\/planStore/)
    expect(errors.join('\n')).toMatch(/platform\/x\.ts.*@\/modules\/proje\/model/)
    expect(errors.join('\n')).toMatch(/platform\/x\.ts.*@\/contracts.*tip/)
  })

  it('dışa aktarma yoluyla sızan içe aktarmayı da bulur', () => {
    const errors = check({ ...valid, 'src/modules/proje/model.ts': "export { usePlanStore } from '@/store/planStore'" })
    expect(errors.join('\n')).toMatch(/proje\/model\.ts.*@\/store\/planStore/)
  })

  it('test dosyalarını denetlemez', () => {
    expect(check({ ...valid, 'src/modules/proje/model.test.ts': "import { usePlanStore } from '@/store/planStore'" })).toEqual([])
  })

  it('ortak bileşen üzerinden plan deposuna ulaşan modülü bulur', () => {
    const errors = check({
      ...valid,
      'src/store/planStore.ts': 'export const usePlanStore = 1',
      'src/components/TransitionPanel.tsx': "import { usePlanStore } from '@/store/planStore'",
      'src/components/Ara.tsx': "export { TransitionPanel } from './TransitionPanel'",
      'src/modules/proje/model.ts': "import { TransitionPanel } from '@/components/Ara'",
    })
    expect(errors.join('\n')).toMatch(/proje\/model\.ts.*@\/components\/Ara.*zincirle.*src\/store\/planStore\.ts/)
  })

  it('yalnız tip alan zinciri ve saf bileşeni kabul eder', () => {
    const errors = check({
      ...valid,
      'src/store/planStore.ts': 'export type X = 1',
      'src/components/Saf.tsx': "import type { X } from '@/store/planStore'\nexport const Saf = 1",
      'src/modules/proje/model.ts': "import { Saf } from '@/components/Saf'",
    })
    expect(errors).toEqual([])
  })

  it('çekirdeğe ayrılmış altyapı dosyasını ve işlevini bulur', () => {
    const errors = check({ ...valid, 'src/modules/proje/model.ts': "import { notifyPlanDeleted } from '@/platform/lifecycle'\nimport { registerPlanSource } from '@/platform/planSource'\nimport { setDefaultKvStore as s } from '@/platform/kv'" })
    expect(errors.join('\n')).toMatch(/model\.ts.*@\/platform\/lifecycle.*çekirdeğe/)
    expect(errors.join('\n')).toMatch(/model\.ts.*@\/platform\/planSource.*çekirdeğe/)
    expect(errors.join('\n')).toMatch(/model\.ts.*@\/platform\/kv.*çekirdeğe/)
  })

  it('modülde sabit olmayan dinamik içe aktarmayı bulur', () => {
    const errors = check({ ...valid, 'src/modules/proje/model.ts': "const name = 'x'\nconst a = () => import(`@/store/${name}`)" })
    expect(errors.join('\n')).toMatch(/model\.ts.*sabit metin/)
  })
})
