import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { routes } from '@/lib/comics'
import { Logo, ThemeToggle } from '@/components/ui'
import { cx } from '@/lib/cx'
import { DOCS, ORDER, type DocKey } from '../docs'
import { ReportForm } from './ReportForm'

type Props = { params: Promise<{ doc: string }> }

export const dynamicParams = false
export const generateStaticParams = () => ORDER.map(doc => ({ doc }))

const isDoc = (d: string): d is DocKey => (ORDER as string[]).includes(d)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { doc } = await params
  if (!isDoc(doc)) return {}
  const d = DOCS[doc]
  return { title: `${d.title} · nacp`, description: d.intro, alternates: { canonical: `https://nacp.id${routes.legal(doc)}` }, openGraph: { title: `${d.title} · nacp`, description: d.intro } }
}

const STEPS = [['01', 'Kirim laporan', 'Isi formulir dengan bukti kepemilikan dan URL konten.'], ['02', 'Verifikasi', 'Tim kami meninjau dan menghubungi partner terkait dalam 2 hari kerja.'], ['03', 'Tindakan', 'Konten yang melanggar diturunkan dan kamu menerima pemberitahuan.']]
const PAD = 'px-4 min-[820px]:px-8'

export default async function LegalPage({ params }: Props) {
  const { doc } = await params
  if (!isDoc(doc)) notFound()
  const d = DOCS[doc]

  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <header className="sticky top-0 z-30 border-b border-line bg-bg">
        <div className={cx('mx-auto flex max-w-[1120px] items-center gap-4 py-3', PAD)}>
          <Logo href={routes.landing} />
          <div className="ml-auto flex gap-2">
            <ThemeToggle labels={{ light: 'Terang', dark: 'Gelap' }} />
            <Link href="/" className="flex h-9 items-center rounded-[9px] bg-accent px-3.5 text-[13px] font-extrabold text-white hover:no-underline">Mulai baca</Link>
          </div>
        </div>
      </header>

      <main className={cx('mx-auto grid w-full max-w-[1120px] flex-1 items-start gap-10 pb-[72px] pt-5 min-[820px]:grid-cols-[220px_minmax(0,1fr)] min-[820px]:pt-12', PAD)}>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto min-[820px]:sticky min-[820px]:top-[84px] min-[820px]:flex-col">
          {ORDER.map(k => (
            <Link key={k} href={routes.legal(k)} aria-current={k === doc ? 'page' : undefined} className={cx('flex-none whitespace-nowrap rounded-[9px] px-3 py-2.5 text-sm font-bold hover:no-underline', k === doc ? 'bg-surface-2 text-ink' : 'bg-transparent text-ink-3')}>{DOCS[k].tab}</Link>
          ))}
        </nav>

        <article className="flex min-w-0 flex-col gap-7">
          <div>
            <h1 className="m-0 text-[30px] font-extrabold tracking-[-0.04em] min-[820px]:text-[42px]">{d.title}</h1>
            <div className="mt-2 font-mono text-xs text-ink-3">Berlaku sejak 1 Oktober 2026</div>
            <p className="mb-0 mt-4 max-w-[68ch] text-base leading-[1.7] text-ink-2">{d.intro}</p>
          </div>

          {d.sections.length > 0 && (
            <>
              <div className="flex flex-wrap gap-1.5">
                {d.sections.map(([h], i) => <a key={h} href={`#s${i + 1}`} className="rounded-full border border-line bg-surface px-[11px] py-1.5 text-xs font-bold text-ink-2">{i + 1}. {h}</a>)}
              </div>
              {d.sections.map(([h, ps], i) => (
                <section key={h} id={`s${i + 1}`} className="flex scroll-mt-20 flex-col gap-2.5 border-t border-line pt-1.5">
                  <h2 className="mb-0 mt-3.5 text-xl font-extrabold tracking-[-0.02em]"><span className="mr-2.5 font-mono text-[13px] font-medium text-ink-3">{i + 1}</span>{h}</h2>
                  {ps.map(p => <p key={p} className="m-0 max-w-[70ch] text-pretty text-[15px] leading-[1.7] text-ink-2">{p}</p>)}
                </section>
              ))}
            </>
          )}

          {doc === 'hakcipta' && (
            <>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
                {STEPS.map(([n, h, b]) => (
                  <div key={n} className="rounded-card border border-line bg-surface p-4"><div className="font-mono text-xs text-accent-text">{n}</div><div className="mt-1.5 text-[15px] font-extrabold">{h}</div><div className="mt-1 text-[13px] leading-[1.55] text-ink-2">{b}</div></div>
                ))}
              </div>
              <ReportForm />
              <div className="text-[13px] leading-[1.6] text-ink-3">Atau kirim email ke <a href="mailto:hakcipta@nacp.id" className="font-bold">hakcipta@nacp.id</a>. Keberatan atas penurunan konten (counter-notice) bisa dikirim ke alamat yang sama.</div>
            </>
          )}
        </article>
      </main>

      <footer className="border-t border-line bg-surface">
        <div className={cx('mx-auto flex max-w-[1120px] flex-wrap gap-4 py-5 text-[13px] text-ink-3', PAD)}>
          <span>© 2026 nacp</span>
          {ORDER.map(k => <Link key={k} href={routes.legal(k)} className="text-ink-2">{DOCS[k].tab}</Link>)}
          <Link href={routes.landing} className="ml-auto text-ink-2">Tentang nacp</Link>
        </div>
      </footer>
    </div>
  )
}
