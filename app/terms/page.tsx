export default function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Legal
        </p>

        <h1 className="text-3xl sm:text-5xl font-bold mt-3">
          Terms & Conditions
        </h1>

        <p className="mt-4 text-sm text-muted-foreground">
          Last updated: September 2026
        </p>
      </div>

      <div className="mt-10 space-y-10 text-sm sm:text-base leading-7">

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold">
            1. Acceptance of Terms
          </h2>

          <p className="mt-3 text-muted-foreground">
            By using this website, you agree to use the
            application only for lawful purposes and in
            accordance with these terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold">
            2. Product Information
          </h2>

          <p className="mt-3 text-muted-foreground">
            Product names, descriptions, prices, images,
            and categories shown on this website are provided
            for demonstration purposes in this portfolio
            project.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold">
            3. Shopping Cart
          </h2>

          <p className="mt-3 text-muted-foreground">
            Products added to the cart are stored using a
            browser cookie. Cart contents may change when
            products are added, removed, or their quantities
            are modified.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold">
            4. Wishlist
          </h2>

          <p className="mt-3 text-muted-foreground">
            Wishlist selections are stored in the user's
            browser using localStorage. Clearing browser
            storage may remove saved wishlist items.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold">
            5. Recently Viewed Products
          </h2>

          <p className="mt-3 text-muted-foreground">
            Recently viewed products are stored for the
            current browser session using sessionStorage.
            These items may be removed when the browsing
            session ends.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold">
            6. Payments and Orders
          </h2>

          <p className="mt-3 text-muted-foreground">
            This portfolio project does not currently
            represent a live payment or order-processing
            service. The checkout functionality is for
            demonstration purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold">
            7. Intellectual Property
          </h2>

          <p className="mt-3 text-muted-foreground">
            Application code, original interface elements,
            and project content created for this demo should
            not be represented as belonging to another
            company or website.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold">
            8. Changes to the Website
          </h2>

          <p className="mt-3 text-muted-foreground">
            Features, product data, designs, and other parts
            of the demo application may be changed or removed
            as development continues.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold">
            9. Contact
          </h2>

          <p className="mt-3 text-muted-foreground">
            Questions regarding this demo project can be
            submitted through the Contact Us page.
          </p>
        </section>

      </div>
    </main>
  );
}