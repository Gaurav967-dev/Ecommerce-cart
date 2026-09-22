export default function AboutPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">
        About Us
      </p>

      <h1 className="text-3xl sm:text-5xl font-bold mt-3">
        Our Story
      </h1>

      <p className="mt-6 text-muted-foreground leading-8">
        We built this store as a modern e-commerce experience
        focused on simple product discovery, easy shopping,
        and a smooth cart and wishlist experience.
      </p>

      <p className="mt-4 text-muted-foreground leading-8">
        Our goal is to make browsing products, saving favorites,
        and managing purchases simple across desktop, tablet,
        and mobile devices.
      </p>
    </main>
  );
}