import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto py-8 px-4">
      <Card className="rounded-xl bg-white shadow-sm">
        <CardHeader className="p-6 pb-2">
          <CardTitle className="text-2xl">Privacy Policy</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Last updated: May 2026</p>
        </CardHeader>
        <CardContent className="p-6 pt-4 flex flex-col gap-6 text-sm text-gray-700 leading-relaxed">

          <p>
            This site runs a prediction league game. This policy explains what data I collect,
            why, and what your rights are.
          </p>

          <section>
            <h2 className="font-semibold text-base text-gray-900 mb-2">Who I am</h2>
            <p>
              This site is operated by Alex Peirson. If you have any questions about your data,
              you can contact me at{' '}
              <a href="mailto:alexlmsapp@icloud.com" className="underline hover:text-gray-900">
                alexlmsapp@icloud.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base text-gray-900 mb-2">What I collect</h2>
            <p className="mb-2">
              When you log in and use the site, I store the following:
            </p>
            <ul className="list-disc list-inside pl-2 flex flex-col gap-1 text-gray-600">
              <li>Your email address</li>
              <li>Your name</li>
              <li>Your league membership (which league you belong to)</li>
              <li>Your predictions</li>
              <li>Your results</li>
            </ul>
            <p className="mt-2 text-muted-foreground">
              I don&apos;t collect anything beyond what&apos;s listed above.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base text-gray-900 mb-2">How you log in</h2>
            <p>
              I use a third-party OAuth provider to handle login. I don&apos;t store your
              password — authentication is handled entirely by the provider you sign in with.
              I only receive your email address from them.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base text-gray-900 mb-2">Where your data is stored</h2>
            <p>
              Your data is stored in a PostgreSQL database hosted by{' '}
              <a href="https://neon.tech" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-900">
                Neon
              </a>{' '}
              (neon.tech), and the site itself is hosted on{' '}
              <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-900">
                Vercel
              </a>{' '}
              (vercel.com). Both are reputable providers with their own security and data
              protection measures.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base text-gray-900 mb-2">Why I collect it</h2>
            <p>
              I use your data to make the game work — to identify you, record your predictions,
              calculate results, and show league standings. I don&apos;t use your data for
              marketing or advertising and I don&apos;t share it with anyone else.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base text-gray-900 mb-2">How long I keep it</h2>
            <p>
              I keep your data for as long as the league is running. If you&apos;d like your
              data removed at any time, just get in touch and I&apos;ll delete it.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base text-gray-900 mb-2">Your rights</h2>
            <p className="mb-2">
              Under UK data protection law, you have the right to:
            </p>
            <ul className="list-disc list-inside pl-2 flex flex-col gap-1 text-gray-600">
              <li>Ask what data I hold about you</li>
              <li>Ask me to correct anything that&apos;s wrong</li>
              <li>Ask me to delete your data</li>
              <li>Withdraw from the league and have your data removed</li>
            </ul>
            <p className="mt-2 text-muted-foreground">
              To exercise any of these, just contact me using the details above.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base text-gray-900 mb-2">Cookies</h2>
            <p>
              I use a session cookie to keep you logged in. I don&apos;t use tracking cookies,
              advertising cookies, or any third-party analytics.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base text-gray-900 mb-2">Contact</h2>
            <p>
              If you have any questions or want your data removed, email me at{' '}
              <a href="mailto:alexlmsapp@icloud.com" className="underline hover:text-gray-900">
                alexlmsapp@icloud.com
              </a>.
            </p>
          </section>

        </CardContent>
      </Card>
    </main>
  );
}
