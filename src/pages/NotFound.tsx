import { Link } from 'react-router'
import { useT } from '../i18n'

export default function NotFound() {
  const t = useT()
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-display text-7xl font-extrabold text-brand">404</p>
      <h1 className="mt-4 text-2xl font-bold">{t.notFound.title}</h1>
      <Link to="/" className="mt-6 inline-flex rounded-full bg-brand px-5 py-2.5 font-semibold text-white shadow-md">
        {t.notFound.back}
      </Link>
    </div>
  )
}
