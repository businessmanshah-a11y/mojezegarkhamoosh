import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Compass, Sparkles } from 'lucide-react';

export const ServicesSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} id="services" className="bg-black py-20 md:py-28 px-4 md:px-6 overflow-hidden relative" dir="rtl">
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            transition={{ duration: 0.6 }}
            className="text-gold-400 text-xs font-semibold tracking-wider block mb-2"
          >
            مسیر بیداری
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-2xl sm:text-4xl md:text-5xl text-white font-bold tracking-tight"
          >
            دو بال دگرگونی درونی
          </motion.h2>
        </div>

        {/* Two-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="liquid-glass rounded-3xl overflow-hidden border border-white/10 group"
          >
            <div className="aspect-video relative overflow-hidden">
              <video
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="p-5 md:p-6 text-right">
              <div className="flex items-center gap-2 mb-2 text-gold-400">
                <Compass className="w-4 h-4" />
                <span className="text-xs font-bold">بینش و آگاهی باطنی</span>
              </div>
              <h3 className="text-lg md:text-xl text-white font-bold mb-2">
                شهود و کشف حقیقت درون
              </h3>
              <p className="text-white/60 text-xs sm:text-sm leading-relaxed font-light">
                شنیدن صدای قلب فراتر از هیاهوی جامعه؛ بازیابی اعتماد به هدایت کیهانی و رهایی از تردیدها.
              </p>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="liquid-glass rounded-3xl overflow-hidden border border-white/10 group"
          >
            <div className="aspect-video relative overflow-hidden">
              <video
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="p-5 md:p-6 text-right">
              <div className="flex items-center gap-2 mb-2 text-gold-400">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold">تجلی و رهایی</span>
              </div>
              <h3 className="text-lg md:text-xl text-white font-bold mb-2">
                زیستن در آتش اکنون
              </h3>
              <p className="text-white/60 text-xs sm:text-sm leading-relaxed font-light">
                رها کردن بارهای سنگین گذشته و اضطراب فردا؛ تجربه بیداری و صلح کامل در تاروپود همین لحظه.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
