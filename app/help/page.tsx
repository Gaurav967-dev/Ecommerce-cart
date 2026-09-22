export default function HelpPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">
        Help Center
      </p>

      <h1 className="text-3xl sm:text-5xl font-bold mt-3">
        How Can We Help?
      </h1>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="border rounded-2xl p-6">
          <h2 className="text-xl font-semibold">
            Shipping
          </h2>
          <p className="mt-3 text-muted-foreground">
            Find information about shipping and delivery.
          </p>
        </div>

        <div className="border rounded-2xl p-6">
          <h2 className="text-xl font-semibold">
            Returns
          </h2>
          <p className="mt-3 text-muted-foreground">
            Learn more about our return process.
          </p>
        </div>

        <div className="border rounded-2xl p-6">
          <h2 className="text-xl font-semibold">
            Orders
          </h2>
          <p className="mt-3 text-muted-foreground">
            Get help with your shopping cart and orders.
          </p>
        </div>

        <div className="border rounded-2xl p-6">
          <h2 className="text-xl font-semibold">
            FAQs
          </h2>
          <p className="mt-3 text-muted-foreground">
            Find answers to commonly asked questions.
          </p>
        </div>
      </div>
    </main>
  );
}