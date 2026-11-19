#!/usr/bin/env node
/**
 * Tarayıcı simgelerini src/assets/brand/mark.svg dosyasından üretir.
 * Çıktılar public klasörüne yazılır. Kaynak işaret değişince bu komutu çalıştırın.
 * Komut: node scripts/build-icons.mjs
 * PNG çizimi için projede zaten kurulu Playwright Chromium kullanılır. Yeni bağımlılık yoktur.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const root = fileURLToPath(new URL('../', import.meta.url))
const mark = readFileSync(`${root}src/assets/brand/mark.svg`, 'utf8')
/* Kare zemin: iOS ve maskable simge köşeyi kendisi yuvarlar. İşaret güvenli alanın içinde kalır. */
const square = mark.replace(/ rx="[\d.]+"/, '')

async function render(page, svg, size) {
  await page.setViewportSize({ width: size, height: size })
  const sized = svg.replace(/width="24" height="24"/, `width="${size}" height="${size}"`)
  await page.setContent(`<!doctype html><html><body style="margin:0;background:transparent">${sized}</body></html>`)
  return page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } })
}

/** Tek PNG taşıyan ICO dosyası. */
function ico(png) {
  const head = Buffer.alloc(22)
  head.writeUInt16LE(0, 0)
  head.writeUInt16LE(1, 2)
  head.writeUInt16LE(1, 4)
  head[6] = 32
  head[7] = 32
  head[8] = 0
  head[9] = 0
  head.writeUInt16LE(1, 10)
  head.writeUInt16LE(32, 12)
  head.writeUInt32LE(png.length, 14)
  head.writeUInt32LE(22, 18)
  return Buffer.concat([head, png])
}

const browser = await chromium.launch()
const page = await browser.newPage({ deviceScaleFactor: 1 })
writeFileSync(`${root}public/favicon.svg`, mark)
writeFileSync(`${root}public/favicon.ico`, ico(await render(page, mark, 32)))
writeFileSync(`${root}public/apple-touch-icon.png`, await render(page, square, 180))
writeFileSync(`${root}public/icon-192.png`, await render(page, mark, 192))
writeFileSync(`${root}public/icon-512.png`, await render(page, mark, 512))
writeFileSync(`${root}public/icon-maskable-512.png`, await render(page, square, 512))
await browser.close()
console.log('Simgeler public klasörüne yazıldı.')
