"use client";

import { useState } from "react";

import { ContactQrCodeModal } from "../layout";
import { BottomCta } from "./custom-software/BottomCta";
import { Hero } from "./custom-software/Hero";
import { ServiceGrid } from "./custom-software/ServiceGrid";
import { WhyUsSection } from "./custom-software/WhyUsSection";

export function CustomSoftwareContent() {
  const [contactOpen, setContactOpen] = useState(false);
  const openContact = () => setContactOpen(true);
  const closeContact = () => setContactOpen(false);

  return (
    <div className="relative">
      <Hero onContact={openContact} />
      <ServiceGrid onContact={openContact} />
      <WhyUsSection />
      <BottomCta onContact={openContact} />

      <ContactQrCodeModal open={contactOpen} onClose={closeContact} />
    </div>
  );
}
