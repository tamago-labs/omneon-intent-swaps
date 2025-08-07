
import HeroSection from "@/components/Landing/Hero";
import HowItWorksSection from "@/components/Landing/HowItWorks";

import SupportedChainsSection from "@/components/Landing/SupportChain"; 
import IntentBuilderSection from "@/components/Landing/IntentBuilder";
import ComparisonTableSection from "@/components/Landing/ComparisonTable";
 
export default function App() {
   
  return (
    <main>
       <HeroSection/>
       <SupportedChainsSection/>
       <HowItWorksSection/>
       {/* <IntentBuilderSection/> */}
       <ComparisonTableSection/> 
    </main>
  );
}