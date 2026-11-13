import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { AmbientVideo } from './AmbientVideo';

export const PhilosophySection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} id="philosophy" className="bg-black py-20 md:py-28 px-4 md:px-6 overflow-hidden" dir="rtl">
      <div className="max-w-5xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            transition={{ duration: 0.6 }}
            className="text-gold-400 text-xs font-semibold tracking-wider block mb-2"
          >
            حکمت بنیادین کتاب
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-2xl sm:text-4xl md:text-5xl text-white font-bold tracking-tight"
          >
            سکوت و حقیقت حضور
          </motion.h2>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
          {/* Left: Video */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="rounded-3xl overflow-hidden aspect-[4/3] relative border border-white/10 shadow-2xl"
          >
            <AmbientVideo
              className="w-full h-full object-cover"
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          </motion.div>

          {/* Right: Concise Text Blocks */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col gap-6"
          >
            <div className="liquid-glass rounded-2xl p-5 border border-white/5">
              <h3 className="text-white text-base md:text-lg font-bold mb-2 text-gold-400">
                گذر از توهم ذهن به ژرفای حقیقت
              </h3>
              <p className="text-white/70 text-xs sm:text-sm leading-relaxed font-light">
                هنگامی که آرام می‌گیرید و هیاهوی ذهن قضاوت‌گر خاموش می‌شود، ندای اصیل روح به گوش می‌رسد؛ جایی که ترس‌ها رنگ می‌بازند و شفافیت پدیدار می‌گردد.
              </p>
            </div>

            <div className="liquid-glass rounded-2xl p-5 border border-white/5">
              <h3 className="text-white text-base md:text-lg font-bold mb-2 text-gold-400">
                هم‌راستایی قلب با کائنات
              </h3>
              <p className="text-white/70 text-xs sm:text-sm leading-relaxed font-light">
                معجزات با انتخاب متولد می‌شوند؛ وقتی مقاومت ذهنی را رها می‌کنید و جریان طبیعی هستی را در آغوش می‌گیرید، درها بی‌صدا گشوده خواهند شد.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
