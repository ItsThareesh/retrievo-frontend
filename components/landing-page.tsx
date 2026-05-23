import { AlertCircle, CheckCircle2, Search } from "lucide-react";
import { useEffect } from "react";

//------------------Glow Element----------------

  export function Glow() {
        useEffect(() => {
        const glow = document.getElementById("scrollGlow");
        if (!glow) return;

        let ticking = false;

        const handleScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
            const scrollY = window.scrollY;
            const factor = Math.min(scrollY / 600, 1);

            glow.style.transform = `
            scale(${1 - factor * 0.7})
            `;

            glow.style.opacity = `${1 - factor * 0.8}`;

            ticking = false;
        });

            ticking = true;
        }
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
        window.removeEventListener("scroll", handleScroll);
        };
    }, []);
    return (
        <div
          id="scrollGlow"
          className="
            pointer-events-none
            absolute bottom-0 left-1/2
            w-[300%] h-[700px]
            origin-bottom
            -translate-x-1/2
            dark:bg-[radial-gradient(ellipse_at_bottom,rgba(93,96,241,0.35),transparent_30%)]
            [mask-image:linear-gradient(to_top,black,transparent)]
            blur-[900px]
            will-change-transform
            transition-transform duration-200 ease-out
            transition-opacity duration-200 ease-out
          "
        ></div>
    )
  }
//-------------------FEATURES-------------------

const featuresData = [
    {
        title: "Report Lost Items",
        description: "Create a detailed report with photos, location and description to alert the community instantly.",
        icon: AlertCircle,
        colorClasses: "bg-green-100 dark:bg-green-900/20 text-green-600"
    },
    {
    title: "Report Found Items",
    description: "Found something? Post it here to help it find its way back to its rightful owner.",
    icon: CheckCircle2,
    colorClasses: "bg-green-100 dark:bg-green-900/20 text-green-600",
  },
  {
    title: "Smart Matching",
    description: "Our platform helps match lost items with found reports based on location, date, and category.",
    icon: Search,
    colorClasses: "bg-blue-100 dark:bg-blue-900/20 text-blue-600",
  }
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-muted/30 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuresData.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="group p-8 rounded-2xl bg-popover border shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.colorClasses}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


//---------------------Frequently asked questions------------------

const faqsData = [
    {
        question: "Is Retrievo free to use?",
        answer: "Yes. Retrievo is completely free for both reporting lost items and helping others recover theirs."
    },
    {
        question: "How do I report a lost item?",
        answer: "Click on “I Lost Something”, add a description, upload photos, and specify where you lost the item. The community can then help match it with found reports."
    },
    {
        question: "How does matching work?",
        answer: "Retrievo compares item category, location, date, and descriptions to help connect lost reports with found items."
    },
    {
        question: "What should I do if I found something valuable?",
        answer: "Create a found-item report with enough detail for identification, but avoid sharing highly sensitive information publicly."
    },
    {
        question: "Can I browse reports without signing in?",
        answer: "Yes. You can browse public reports freely. Signing in is only required when creating or managing reports."
    }
];

export function FAQSection() {
  return (
    <section className="py-24 px-4 border-t bg-background/50 backdrop-blur">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Everything you need to know about Retrievo.
          </p>
        </div>

        <div className="space-y-4">
          {faqsData.map((faq, index) => (
            <details
              key={index}
              className="group rounded-2xl border bg-background/60 backdrop-blur-xl p-6 transition-all duration-300 hover:border-blue-600/20 hover:shadow-sm hover:shadow-blue-900/30"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-lg">
                {faq.question}
                <span className="transition-transform duration-300 group-open:rotate-45 text-primary group-open:hover:text-red-800 text-2xl">
                  +
                </span>
              </summary>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}