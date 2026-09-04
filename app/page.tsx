import Navbar from "@/components/navbar/Navbar";
import HeroSection from "@/components/home/HeroSection";
import PopularProducts from "@/components/home/popular-products";
import CategorySection from "@/components/home/CategorySection";
import ProductSection from "@/components/home/ProductSection";
import CategoryProductsSection from "@/components/home/CategoryProductsSection";

export default function HomePage() {
  return (
    <>
      <main>
        <HeroSection />
        <CategorySection />
        <PopularProducts />
        {/* <ProductSection /> */}
        <CategoryProductsSection />
      </main>
    </>
  );
}