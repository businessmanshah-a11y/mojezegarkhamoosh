import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Headphones, ArrowDown } from 'lucide-react';

export const FeaturedVideoSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="bg-black py-10 md:py-16 px-4 md:px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
          className="relative rounded-3xl overflow-hidden aspect-video shadow-2xl border border-white/10 group"
        >
          {/* Ambient Video */}
          <video
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4"
          />

          {/* Soft Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

          {/* Bottom Card (Concise Persian, No English) */}
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4" dir="rtl">
            <div className="liquid-glass rounded-2xl p-4 md:p-5 max-w-md bg-black/60 backdrop-blur-md">
              <span className="text-gold-400 text-xs font-semibold block mb-1">
                کیفیت استودیویی روایت
              </span>
              <p className="text-white text-xs sm:text-sm leading-relaxed font-light">
                تولید شده با گویندگی شیوا و تنظیم اختصاصی؛ طنین واژه‌ها در گوش شما تجربه حضوری ژرف در لحظه حال را رقم می‌زند.
              </p>
            </div>

            <motion.a
              href="#audiobook"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="liquid-glass liquid-glass-interactive rounded-full px-5 py-2.5 text-white text-xs font-semibold flex items-center gap-2 whitespace-nowrap self-stretch sm:self-auto justify-center cursor-pointer"
            >
              <Headphones className="w-3.5 h-3.5 text-gold-400" />
              <span>فهرست فصول صوتی</span>
              <ArrowDown className="w-3.5 h-3.5 text-white/50" />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
