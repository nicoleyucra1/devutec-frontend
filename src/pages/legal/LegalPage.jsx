import { Link } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import SiteFooter from '../../components/landing/SiteFooter'
import { useAuth } from '../../hooks/useAuth'
import { LEGAL_DOCS } from './legalContent'
import PropTypes from 'prop-types'

export default function LegalPage({ doc }) {
  const { user } = useAuth()
  const { kicker, title, updated, sections } = LEGAL_DOCS[doc]
  const other = doc === 'terms' ? { to: '/privacidad', label: 'Política de privacidad' } : { to: '/terminos', label: 'Términos y condiciones' }

  return (
    <>
      {!user && <PublicHeader />}
      <main className="mx-auto w-full max-w-[760px] px-6 py-14">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-escrow">{kicker}</p>
        <h1 className="mt-3 font-serif text-4xl italic text-ink">{title}</h1>
        <p className="mt-2 text-sm text-muted">Última actualización: {updated}</p>

        <div className="mt-10 grid gap-8">
          {sections.map((section, index) => (
            <section key={section.heading}>
              <h2 className="flex gap-3 text-lg font-semibold text-ink">
                <span className="font-serif italic text-escrow">{String(index + 1).padStart(2, '0')}</span>
                {section.heading}
              </h2>
              <div className="mt-2 grid gap-2 text-sm leading-relaxed text-muted">
                {section.paragraphs.map((text) => (
                  <p key={text}>{text}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-12 border-t border-line pt-6 text-sm text-muted">
          Lee también nuestra{' '}
          <Link to={other.to} className="font-medium text-escrow underline underline-offset-4">
            {other.label}
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
    </>
  )
}

LegalPage.propTypes = {
  doc: PropTypes.oneOf(Object.keys(LEGAL_DOCS)).isRequired,
}
