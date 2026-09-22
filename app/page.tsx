import HeroSection from "@/components/HeroSection";
import CategorySection from "@/components/CategorySection";
import FeaturedProducts from "@/components/FeaturedProducts";
import StorySection from "@/components/StorySection";
import ReviewsSection from "@/components/ReviewsSection";

export default function Home() {
  return (
    <main>
      <HeroSection />

      <CategorySection />

      <FeaturedProducts />

      <StorySection />

      <ReviewsSection />
    </main>
  );
}