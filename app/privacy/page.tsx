export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Legal
        </p>

        <h1 className="text-3xl sm:text-5xl font-bold mt-3">
          Privacy Policy
        </h1>

        <p className="mt-4 text-sm text-muted-foreground">
          Last updated: September 2026
        </p>
      </div>

      <div className="mt-10 space-y-10 text-sm sm:text-base leading-7">

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold">
            1. Introduction
          </h2>

          <p className="mt-3 text-muted-foreground">
            This Privacy Policy explains how this website
            handles information when you browse products,
            use the wishlist, and manage your shopping cart.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold">
            2. Information We Collect
          </h2>

          <p className="mt-3 text-muted-foreground">
            This demo application may process information
            needed to provide the shopping experience,
            such as product selections, wishlist items,
            and cart information.
          </p>

          <p className="mt-3 text-muted-foreground">
            The project may also use browser storage
            technologies such as localStorage, cookies,
            and sessionStorage for application functionality.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold">
            3. Browser Storage
          </h2>

          <p className="mt-3 text-muted-foreground">
            Wishlist information is stored in localStorage
            so that selected products remain available after
            refreshing the browser.
          </p>

          <p className="mt-3 text-muted-foreground">
            Cart information is stored in a browser cookie
            to preserve the current cart between page visits
            and browser refreshes.
          </p>

          <p className="mt-3 text-muted-foreground">
            Recently viewed products are stored in
            sessionStorage for the current browser session.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold">
            4. How Information Is Used
          </h2>

          <p className="mt-3 text-muted-foreground">
            Information handled by the application is used
            to provide features such as product discovery,
            wishlist management, cart management, and
            recently viewed products.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold">
            5. Third-Party Services
          </h2>

          <p className="mt-3 text-muted-foreground">
            This demo application may display images hosted
            by third-party image providers. Such providers
            may have their own terms and privacy practices.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold">
            6. Data Security
          </h2>

          <p className="mt-3 text-muted-foreground">
            Reasonable development practices are used to
            protect application data. This portfolio project
            should not be treated as a production security
            implementation.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold">
            7. Changes to This Policy
          </h2>

          <p className="mt-3 text-muted-foreground">
            This policy may be updated as the application
            features change.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold">
            8. Contact
          </h2>

          <p className="mt-3 text-muted-foreground">
            For questions about this demo application's
            privacy practices, please use the Contact Us
            page.
          </p>
        </section>

      </div>
    </main>
  );
}