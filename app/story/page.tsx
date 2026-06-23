import { HeroSection } from "@/components/story/hero-section";
import { ProblemSection } from "@/components/story/problem-section";
import { SolutionSection } from "@/components/story/solution-section";
import { ReportItemsSection } from "@/components/story/report-items-section";
import { PrivacySection } from "@/components/story/privacy-section";
import { VisibilitySection } from "@/components/story/visibility-section";
import { ClaimVerificationSection } from "@/components/story/claim-verification-section";
import { NotificationsSection } from "@/components/story/notifications-section";
import { EmailNotificationsSection } from "@/components/story/email-notifications-section";
import { MatchingEngineSection } from "@/components/story/matching-engine-section";
import { BuiltForTrustSection } from "@/components/story/built-for-trust-section";
import { TechArchitectureSection } from "@/components/story/tech-architecture-section";
import { ImpactSection } from "@/components/story/impact-section";
import { FinalSection } from "@/components/story/final-section";

export default function StoryPage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <ReportItemsSection />
      <PrivacySection />
      <VisibilitySection />
      <ClaimVerificationSection />
      <NotificationsSection />
      <EmailNotificationsSection />
      <MatchingEngineSection />
      <BuiltForTrustSection />
      <TechArchitectureSection />
      <ImpactSection />
      <FinalSection />
    </div>
  );
}
