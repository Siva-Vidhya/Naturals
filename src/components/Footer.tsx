import { Sparkles, Instagram, Twitter, Linkedin, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-20 bg-cream/20 border-t border-white/40">
      <div className="container px-6 mx-auto">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blush to-lavender shadow-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">NeuroStrom</span>
            </div>
            <p className="text-sm text-foreground/50 leading-relaxed mb-6">
              The futuristic OS for high-end salons and beauty clinics. Empowering stylists with AI since 2026.
            </p>
            <div className="flex gap-4">
              {[Instagram, Twitter, Linkedin, Github].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-lavender/10 transition-colors">
                  <Icon className="w-5 h-5 text-foreground/40" />
                </a>
              ))}
            </div>
          </div>

          {[
            { title: "Product", links: ["Features", "AI Demo", "Dashboard", "Pricing"] },
            { title: "Company", links: ["About Us", "Careers", "Press", "Contact"] },
            { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Security"] }
          ].map((col, i) => (
            <div key={i}>
              <h4 className="font-bold mb-6">{col.title}</h4>
              <ul className="space-y-4">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <a href="#" className="text-sm text-foreground/40 hover:text-lavender transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-20 pt-8 border-t border-white/20 flex flex-col md:row-reverse md:flex-row justify-between items-center gap-4">
          <div className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.2em]">
            &copy; 2026 NeuroStrom AI. All rights reserved.
          </div>
          <div className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.2em]">
            Designed with luxury in mind
          </div>
        </div>
      </div>
    </footer>
  );
}
