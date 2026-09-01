import Navbar from "@/components/navbar/Navbar";
import HeroSection from "@/components/home/HeroSection";
import CategorySection from "@/components/home/CategorySection";
import ProductSection from "@/components/home/ProductSection";

export default function HomePage() {
  return (
    <>
      <main>
        <HeroSection />
        <CategorySection />
        <ProductSection />
      </main>
    </>
  );
}