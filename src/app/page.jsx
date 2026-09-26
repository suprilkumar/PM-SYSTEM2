// src/app/page.jsx
import Header from "./home/Header";
import Footer from "./home/Footer";
import Hero from "./home/Hero";
import Features from "./home/Features";
import Privacy from "./home/Privacy";
import Pricing from "./home/Pricing";
import CTA from "./home/CTA";

export const metadata = {
  title: "Home",
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <Privacy />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}