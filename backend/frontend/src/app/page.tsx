import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import MascotsSection from "@/components/MascotsSection";
import PricingSection from "@/components/PricingSection";
import ContactSection from "@/components/ContactSection";

export default function Home() {
  return (
    <main className="bg-[#07070A] overflow-x-hidden min-h-screen w-full relative">
      <HeroSection />
      <FeaturesSection />
      <MascotsSection />
      <PricingSection />
      <ContactSection />
    </main>
  );
}
