import { textLinkClassName } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-[45rem] md:pt-4">
      <Card>
        <CardHeader className="space-y-1 p-5 pb-2 md:p-8 md:pb-2">
          <h1 className="text-[1.625rem] font-extrabold leading-[1.875rem] md:text-[2.125rem] md:leading-10">
            Privacy Policy
          </h1>
          <p className="text-[0.8125rem] font-semibold text-muted-foreground">
            Last updated: September 2026
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 p-5 pt-4 text-[0.9375rem] leading-relaxed md:p-8 md:pt-4">
          <p>
            This site runs a prediction league game. This policy explains what
            data I collect, why, and what your rights are.
          </p>

          <section>
            <h2 className="mb-2 text-lg font-extrabold">Who I am</h2>
            <p>
              This site is operated by Alex Peirson. If you have any questions
              about your data, you can contact me at{' '}
              <a
                href="mailto:alexlmsapp@icloud.com"
                className={textLinkClassName}
              >
                alexlmsapp@icloud.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-extrabold">What I collect</h2>
            <p className="mb-2">
              When you log in and use the site, I store the following:
            </p>
            <ul className="flex list-inside list-disc flex-col gap-1 pl-2 marker:text-primary">
              <li>Your email address</li>
              <li>Your name</li>
              <li>Your league membership (which league you belong to)</li>
              <li>Your predictions</li>
              <li>Your results</li>
              <li>
                Your password, stored only as a bcrypt hash, if you set one
              </li>
              <li>
                Failed sign-in attempts: the email address entered and the IP
                address it came from
              </li>
            </ul>
            <p className="mt-2 text-muted-foreground">
              I don&apos;t collect anything beyond what&apos;s listed above.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-extrabold">How you sign in</h2>
            <p className="mb-2">
              You can sign in with a magic link emailed to you, or with a
              password. If you set a password, I store it only as a bcrypt hash
              — I never see or keep the password itself.
            </p>
            <p>
              To protect accounts from password guessing, I record every failed
              sign-in attempt: the email address entered and the IP address it
              came from. Too many failed attempts in a short period are refused.
              I use these records only for this security check.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-extrabold">
              Where your data is stored
            </h2>
            <p>
              Your data is stored in a PostgreSQL database hosted by{' '}
              <a
                href="https://neon.tech"
                target="_blank"
                rel="noopener noreferrer"
                className={textLinkClassName}
              >
                Neon
              </a>{' '}
              (neon.tech), and the site itself is hosted on{' '}
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noopener noreferrer"
                className={textLinkClassName}
              >
                Vercel
              </a>{' '}
              (vercel.com). Both are reputable providers with their own security
              and data protection measures.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-extrabold">Why I collect it</h2>
            <p>
              I use your data to make the game work — to identify you, record
              your predictions, calculate results, and show league standings. I
              don&apos;t use your data for marketing or advertising and I
              don&apos;t share it with anyone else.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-extrabold">How long I keep it</h2>
            <p>
              I keep your data for as long as the league is running. Failed
              sign-in records are the exception: once a record is over a day
              old, the next failed sign-in clears it out. Quiet periods can hold
              a record a little longer, because the clear-out runs on that next
              attempt. If you&apos;d like your data removed at any time, just
              get in touch and I&apos;ll delete it.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-extrabold">Your rights</h2>
            <p className="mb-2">
              Under UK data protection law, you have the right to:
            </p>
            <ul className="flex list-inside list-disc flex-col gap-1 pl-2 marker:text-primary">
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
            <h2 className="mb-2 text-lg font-extrabold">Cookies</h2>
            <p>
              I use a session cookie to keep you logged in. I don&apos;t use
              tracking cookies, advertising cookies, or any third-party
              analytics.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-extrabold">Contact</h2>
            <p>
              If you have any questions or want your data removed, email me at{' '}
              <a
                href="mailto:alexlmsapp@icloud.com"
                className={textLinkClassName}
              >
                alexlmsapp@icloud.com
              </a>
              .
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
