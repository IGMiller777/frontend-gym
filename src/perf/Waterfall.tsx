import { useId } from 'react'
import { useL } from '../i18n'
import { usePerfT } from './strings'
import type { Report, ResourceKind } from './types'

const kindColor: Record<ResourceKind, string> = {
  html: '#6366f1',
  css: '#a855f7',
  js: '#f59e0b',
  image: '#10b981',
  font: '#ec4899',
  'third-party': '#64748b',
}

/** Short badges on the chart; the table below spells the kinds out in the interface language. */
const kindBadge: Record<ResourceKind, string> = { html: 'HTML', css: 'CSS', js: 'JS', image: 'IMG', font: 'FONT', 'third-party': 'TAG' }

const LABEL = 190
const CHART = 470
const ROW = 26
const TOP = 30

/** A "nice" tick step so that the axis has 4 to 8 ticks. */
function tickStep(max: number): number {
  for (const step of [100, 200, 250, 500, 1000, 2000, 2500, 5000, 10_000, 20_000]) if (max / step <= 8) return step
  return 50_000
}

/**
 * The loading waterfall of a typical user: when each resource was found, downloaded and executed,
 * with the first paint and LCP marked. The same data is available as a table for screen readers.
 */
export function Waterfall({ data }: { data: Report['waterfall'] }) {
  const t = usePerfT()
  const l = useL()
  const hatch = useId()
  const { rows, fcp, lcp } = data
  const max = Math.max(lcp, ...rows.map((r) => r.execEnd ?? r.end)) * 1.08
  const x = (ms: number) => LABEL + (ms / max) * CHART
  const step = tickStep(max)
  const ticks = Array.from({ length: Math.floor(max / step) + 1 }, (_, i) => i * step)
  const height = TOP + rows.length * ROW + 44

  return (
    <figure>
      <figcaption className="text-sm text-muted">{t.waterfallFor(t.segmentNames[data.segment])}</figcaption>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-muted">{t.empty}</p>
      ) : (
        <div className="mt-2 overflow-x-auto">
          <svg viewBox={`0 0 ${LABEL + CHART + 10} ${height}`} role="img" aria-label={t.waterfallAlt(t.ms(fcp), t.ms(lcp))} className="min-w-[540px] text-ink" style={{ width: '100%' }}>
            <defs>
              <pattern id={hatch} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="6" height="6" fill="#f59e0b" opacity="0.35" />
                <line x1="0" y1="0" x2="0" y2="6" stroke="#b45309" strokeWidth="2.5" />
              </pattern>
            </defs>
            {ticks.map((ms) => (
              <g key={ms}>
                <line x1={x(ms)} x2={x(ms)} y1={TOP - 6} y2={TOP + rows.length * ROW} stroke="currentColor" strokeOpacity="0.12" />
                <text x={x(ms)} y={TOP - 12} textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.7">
                  {t.ms(ms)}
                </text>
              </g>
            ))}
            {rows.map((r, i) => {
              const y = TOP + i * ROW
              const name = l(r.label)
              return (
                <g key={r.id}>
                  <rect x={0} y={y + 5} width={46} height={16} rx={5} fill={kindColor[r.kind]} />
                  <text x={23} y={y + 16.5} textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">
                    {kindBadge[r.kind]}
                  </text>
                  <text x={52} y={y + 17} fontSize="11" fill="currentColor">
                    {(name.length > 21 ? `${name.slice(0, 20)}…` : name) + (r.lcp ? ' ★' : '')}
                  </text>
                  <line x1={x(r.found)} x2={x(r.start)} y1={y + 13} y2={y + 13} stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.5" />
                  <rect x={x(r.start)} y={y + 6} width={Math.max(2, x(r.end) - x(r.start))} height={14} rx={3} fill={kindColor[r.kind]} stroke={r.blocking ? 'currentColor' : 'none'} strokeWidth={r.blocking ? 2 : 0} />
                  {r.execEnd !== undefined && r.execEnd > r.end && <rect x={x(r.end)} y={y + 6} width={Math.max(2, x(r.execEnd) - x(r.end))} height={14} rx={3} fill={`url(#${hatch})`} />}
                </g>
              )
            })}
            {(
              [
                ['FCP', fcp, '6 4'],
                ['LCP', lcp, undefined],
              ] as const
            ).map(([name, ms, dash], i) => {
              const right = x(ms) > LABEL + CHART * 0.75
              return (
                <g key={name} className={i ? 'text-rose-700 dark:text-rose-300' : 'text-blue-700 dark:text-blue-300'}>
                  <line x1={x(ms)} x2={x(ms)} y1={TOP - 4} y2={TOP + rows.length * ROW + 6} stroke="currentColor" strokeWidth="2" strokeDasharray={dash} />
                  <text x={x(ms)} y={TOP + rows.length * ROW + 20 + i * 14} dx={right ? -5 : 5} textAnchor={right ? 'end' : 'start'} fontSize="11" fontWeight="700" fill="currentColor">
                    {name} {t.ms(ms)}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      )}
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block h-0.5 w-5 bg-current opacity-60" /> {t.legend.wait}
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block h-3 w-5 rounded-sm bg-emerald-500" /> {t.legend.download}
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block h-3 w-5 rounded-sm" style={{ background: 'repeating-linear-gradient(45deg, #b45309 0 2px, #fcd34d 2px 5px)' }} /> {t.legend.exec}
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block h-3 w-5 rounded-sm border-2 border-ink bg-purple-500" /> {t.legend.blocking}
        </li>
        <li>★ {t.legend.lcpMark}</li>
      </ul>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer font-semibold text-muted">{t.waterfallTable}</summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th scope="col" className="py-1 pr-3 font-semibold">{t.columns.resource}</th>
                <th scope="col" className="py-1 pr-3 font-semibold">{t.columns.found}</th>
                <th scope="col" className="py-1 pr-3 font-semibold">{t.columns.loaded}</th>
                <th scope="col" className="py-1 font-semibold">{t.columns.executed}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-line">
                  <th scope="row" className="py-1 pr-3 font-normal">
                    {t.kinds[r.kind]}: {l(r.label)}
                    {r.blocking ? ` (${t.legend.blocking})` : ''}
                    {r.lcp ? ` (${t.legend.lcpMark})` : ''}
                  </th>
                  <td className="py-1 pr-3">{t.ms(r.found)}</td>
                  <td className="py-1 pr-3">{t.ms(r.end)}</td>
                  <td className="py-1">{r.execEnd !== undefined ? t.ms(r.execEnd) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  )
}
