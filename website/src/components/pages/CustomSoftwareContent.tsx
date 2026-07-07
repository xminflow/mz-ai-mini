"use client";

import { useState } from "react";

import { ContactQrCodeModal } from "../layout";
import { BottomCta } from "./custom-software/BottomCta";
import { Hero } from "./custom-software/Hero";
import { ProcessSection } from "./custom-software/ProcessSection";
import { ServiceGrid } from "./custom-software/ServiceGrid";
import { TechStackSection } from "./custom-software/TechStackSection";
import { WhyUsSection } from "./custom-software/WhyUsSection";

export function CustomSoftwareContent() {
  const [contactOpen, setContactOpen] = useState(false);
  const openContact = () => setContactOpen(true);
  const closeContact = () => setContactOpen(false);

  return (
    <div className="relative">
      <Hero onContact={openContact} />
      <ServiceGrid />
      <WhyUsSection />
      <ProcessSection />
      <TechStackSection />
      <BottomCta onContact={openContact} />

      <ContactQrCodeModal open={contactOpen} onClose={closeContact} />
    </div>
  );
}
