import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 - Page Not Found | WeightWin',
  description: 'The page you are looking for does not exist.',
}

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white px-4 py-16">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <div className="relative inline-block">
            <h1 className="text-9xl md:text-[12rem] font-black text-primary-600 opacity-20 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-primary-600 rounded-3xl p-6 md:p-8 shadow-2xl">
                <svg
                  className="w-16 h-16 md:w-20 md:h-20 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">
            Oops! Page Not Found
          </h2>
          <p className="text-lg md:text-xl text-neutral-600 max-w-md mx-auto">
            Don&apos;t worry, even scales need recalibrating sometimes. Let&apos;s get you back on track!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Go Home
          </Link>

          <Link
            href="/preview/weight-check"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-success-600 text-white font-semibold rounded-xl hover:bg-success-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Start Free Trial
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <Link
            href="/#how-it-works"
            className="text-neutral-600 hover:text-primary-600 font-medium transition-colors duration-200 hover:underline"
          >
            How It Works
          </Link>
          <span className="text-neutral-300">•</span>
          <Link
            href="/#for-nutritionists"
            className="text-neutral-600 hover:text-primary-600 font-medium transition-colors duration-200 hover:underline"
          >
            For Nutritionists
          </Link>
          <span className="text-neutral-300">•</span>
          <a
            href="mailto:support@weightwin.com"
            className="text-neutral-600 hover:text-primary-600 font-medium transition-colors duration-200 hover:underline"
          >
            Contact Support
          </a>
        </div>

        <div className="mt-12 p-6 bg-white rounded-2xl shadow-lg border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-3">Looking for something specific?</h3>
          <ul className="space-y-3 text-left max-w-md mx-auto">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <Link href="/" className="text-neutral-900 font-medium hover:text-primary-600 transition-colors">
                  Home Page
                </Link>
                <p className="text-sm text-neutral-600">Learn about the 7-day challenge</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <Link
                  href="/preview/dashboard"
                  className="text-neutral-900 font-medium hover:text-primary-600 transition-colors"
                >
                  Preview Dashboard
                </Link>
                <p className="text-sm text-neutral-600">See how the app works</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <Link href="/login" className="text-neutral-900 font-medium hover:text-primary-600 transition-colors">
                  Log In
                </Link>
                <p className="text-sm text-neutral-600">Access your account</p>
              </div>
            </li>
          </ul>
        </div>

        <p className="mt-8 text-sm text-neutral-500">
          Error Code: 404 • Page Not Found • Need help?{' '}
          <a href="mailto:support@weightwin.com" className="text-primary-600 hover:text-primary-700 font-medium hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  )
}




