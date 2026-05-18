import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Users,
  Clock,
  Package,
  CreditCard,
  Shield,
  Check,
} from "lucide-react";
import anime from "animejs";
import { Button } from "../components/Button";
import medicalVideo from "../assets/medicare_hero.mp4";

export const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Entrance animation
    anime({
      targets: ".animate-in",
      translateY: [30, 0],
      opacity: [0, 1],
      delay: anime.stagger(150),
      duration: 1000,
      easing: "easeOutQuart",
    });

    // Observer for sections
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.4 },
    );

    document
      .querySelectorAll(".snap-section")
      .forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: <Users className="h-10 w-10" />,
      title: "Comprehensive Patient Records",
      desc: "Manage patient history, treatments, and prescriptions in one secure location. Instant lookup ensures you never lose a patient's context.",
      benefits: [
        "Electronic Health Records",
        "Visit History Tracking",
        "Secure Data Storage",
      ],
    },
    {
      icon: <Clock className="h-10 w-10" />,
      title: "Real-time Queue Management",
      desc: "Monitor patient flow with a dynamic, real-time queue system. Reduce waiting times and improve clinical efficiency effortlessly.",
      benefits: [
        "Live Token Tracking",
        "Automated Flow Control",
        "Waiting Time Prediction",
      ],
    },
    {
      icon: <Package className="h-10 w-10" />,
      title: "Intelligent Inventory Control",
      desc: "Track medicine stock levels, expiries, and usage in real-time. Automated alerts keep your pharmacy running smoothly without manual checks.",
      benefits: [
        "Expiry Date Monitoring",
        "Low Stock Alerts",
        "Automated Reordering",
      ],
    },
    {
      icon: <CreditCard className="h-10 w-10" />,
      title: "Seamless Billing & Checkout",
      desc: "Generate professional invoices and process payments in seconds. Integrated with your inventory for instant stock deduction.",
      benefits: [
        "Instant Invoice Generation",
        "Integrated Payments",
        "Financial Reporting",
      ],
    },
  ];

  return (
    <div className="bg-white font-sans text-slate-900 overflow-hidden h-screen scroll-container selection:bg-emerald-100 selection:text-emerald-900">
      {/* Hero Section */}
      <section
        className="snap-section h-screen relative flex items-center overflow-hidden"
        data-index="0"
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src={medicalVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/40 to-transparent z-20" />

        <div className="relative z-30 w-full px-8 lg:px-24">
          <div className="max-w-4xl space-y-8">
            <div className="animate-in flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Activity className="h-6 w-6" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                Medicare<span className="text-emerald-600">Pro</span>
              </span>
            </div>

            <h1 className="animate-in text-6xl lg:text-8xl font-black leading-[1.05] tracking-tight text-slate-900">
              Modern Care <br />
              <span className="text-emerald-600">Simplified.</span>
            </h1>

            <p className="animate-in text-xl text-slate-600 font-medium max-w-lg leading-relaxed">
              The professional-grade management system for modern medical
              practices. Efficiency, security, and precision at every step.
            </p>

            <div className="animate-in flex items-center gap-6 pt-4">
              <Button
                size="lg"
                onClick={() => navigate("/login")}
                className="h-16 px-10 text-lg font-black bg-slate-900 text-white hover:bg-emerald-600 transition-all rounded-2xl shadow-2xl"
              >
                Try It Now Free
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-8 lg:left-24 flex items-center gap-4 text-slate-400 z-30 animate-bounce">
          <div className="w-px h-12 bg-slate-200" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] rotate-180 [writing-mode:vertical-lr]">
            Scroll
          </span>
        </div>
      </section>

      {/* Feature Sections */}
      {features.map((feature, idx) => (
        <section
          key={idx}
          className="snap-section h-screen flex items-center px-8 lg:px-24 relative bg-white border-t border-slate-50"
          data-index={idx + 1}
        >
          <div className="w-full px-8 lg:px-24 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10 reveal-content">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
                  {feature.icon}
                </div>
                <h2 className="text-5xl font-black tracking-tight text-slate-900">
                  {feature.title}
                </h2>
              </div>

              <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-xl">
                {feature.desc}
              </p>

              <div className="space-y-4">
                {feature.benefits.map((benefit, bIdx) => (
                  <div key={bIdx} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Check className="h-3 w-3 text-emerald-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:flex justify-end reveal-visual">
              <div className="w-full aspect-square max-w-lg bg-slate-50 rounded-[3rem] border border-slate-100 flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-slate-200 group-hover:text-emerald-500 transition-colors duration-500 scale-150 transform group-hover:scale-125">
                  {React.cloneElement(feature.icon as React.ReactElement<any>, {
                    className: "h-48 w-48",
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Final CTA */}
      <section
        className="snap-section h-screen flex items-center justify-center text-center px-8 relative bg-slate-900"
        data-index="5"
      >
        <div className="space-y-12 max-w-4xl relative z-10">
          <h2 className="text-6xl lg:text-8xl font-black text-white leading-none tracking-tight">
            Ready to <span className="text-emerald-500">Upgrade?</span>
          </h2>
          <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Join the modern healthcare movement. Secure your clinic's future
            with Medicare Pro today.
          </p>
          <div className="pt-8">
            <Button
              size="lg"
              onClick={() => navigate("/login")}
              className="h-20 px-16 text-xl font-black rounded-full bg-white text-slate-900 hover:bg-emerald-500 hover:text-white transition-all shadow-2xl"
            >
              Get Started for Free
            </Button>
            <div className="mt-8 flex items-center justify-center gap-6 text-slate-500 text-xs font-black uppercase tracking-widest">
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4" /> Secure SSL
              </span>
              <span className="flex items-center gap-2">
                <Activity className="h-4 w-4" /> 24/7 Support
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Styles for reveal effect */}
      <style>{`
        .snap-section .reveal-content, .snap-section .reveal-visual {
          opacity: 0;
          transform: translateY(40px);
          transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .snap-section.is-visible .reveal-content, .snap-section.is-visible .reveal-visual {
          opacity: 1;
          transform: translateY(0);
        }
        .snap-section.is-visible .reveal-visual {
          transition-delay: 0.2s;
        }
      `}</style>
    </div>
  );
};
