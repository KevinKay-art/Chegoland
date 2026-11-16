import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { FarmImage } from '../components/FarmImage.tsx';

const TEAM = [
  {
    name: 'Samuel Chege',
    role: 'Founder & Herd Manager',
    bio: 'Started Chegoland in 2018 in Kapcholyo, Kaplong with three Friesian heifers and a focus on rotational kikuyu and lucerne pastures.',
  },
  {
    name: 'Dr. Beatrice Lang’at',
    role: 'Veterinary & Milk Quality Lead',
    bio: 'Oversees daily herd wellness, somatic cell screening, and morning/evening parlour sanitation protocols.',
  },
  {
    name: 'Grace Wambui',
    role: 'Cold-Chain & Regional Dispatch',
    bio: 'Coordinates our 5:30 AM chilled dispatches from Kaplong across Sotik, Bomet, Kericho, and Nairobi.',
  },
];

const HYGIENE_PRACTICES = [
  {
    title: 'Stainless-Steel Parlour & Closed Piping',
    detail:
      'Every cow is pre-dipped and post-dipped with food-safe iodine teat solution; milk travels directly into sanitized stainless cans with zero open-air exposure.',
  },
  {
    title: 'Rapid 4°C Flash Chilling',
    detail:
      'Within 30 minutes of milking, fresh milk is cooled to 4°C to preserve natural sweet flavour and inhibit bacterial growth without any chemical preservatives.',
  },
  {
    title: 'Daily Density & Mastitis Screening',
    detail:
      'Each morning batch undergoes lactometer specific-gravity checks and California Mastitis Testing before bottling or culturing into mala and yoghurt.',
  },
  {
    title: 'Zero-Grazed Herd Nutrition',
    detail:
      'Our cows are comfortably zero-grazed in clean, shaded, ventilated stalls and fed freshly chopped green Napier grass, lucerne hay, maize silage, mineral licks, and clean borehole water—never routine antibiotics.',
  },
];

export function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-16">
      {/* Farm Story Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-6 flex flex-col justify-center">
          <p className="text-xs font-semibold text-[#2E7D32] tracking-wide mb-2">
            CHEGOLAND Agri-Empire LTD · Kapcholyo, Kaplong · Sotik Constituency
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#2C1E16] leading-tight text-balance">
            Honest Kenyan dairy farming, straight to your family’s table
          </h1>
          <p className="mt-5 text-base text-[#5D4B41] leading-relaxed">
            CHEGOLAND Agri-Empire LTD Dairy Farm and Shop began in Kapcholyo, Kaplong with a
            simple frustration: families across Sotik, Bomet, Kericho, and Nairobi struggled to
            find whole milk that hadn’t passed through multiple middlemen, been watered down, or
            sat unchilled in transit.
          </p>
          <p className="mt-4 text-base text-[#5D4B41] leading-relaxed">
            Today, our small-batch herd of zero-grazed Friesian, Ayrshire, and Jersey cows lives
            in clean, shaded dairy stalls at 1,900 metres above sea level—fed freshly cut Napier
            grass, lucerne, and silage daily. We bottle, ferment, churn, and deliver our entire
            harvest directly with full traceability from cow tag to kitchen doorstep.
          </p>
          <div className="mt-7">
            <Link
              to="/shop"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-sm font-semibold transition-colors"
            >
              Shop Today’s Harvest
            </Link>
          </div>
        </div>

        <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-[#E6DEC8] min-h-[320px]">
          <FarmImage
            src="/src/assets/images/hero_zerograzing_cows_1794821932714.jpg"
            alt="CHEGOLAND Agri-Empire LTD zero-grazing dairy stalls with Friesian and Ayrshire cows eating fresh Napier grass"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Hygiene & Quality Practices */}
      <section className="bg-white rounded-2xl border border-[#E6DEC8] p-8 sm:p-10">
        <div className="max-w-2xl mb-8">
          <h2 className="font-display text-3xl font-bold text-[#2C1E16]">
            Hygiene &amp; Quality Practices
          </h2>
          <p className="mt-2.5 text-base text-[#5D4B41]">
            Clean milk starts with calm cows, sanitized stainless steel, and uninterrupted cold
            storage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {HYGIENE_PRACTICES.map((item) => (
            <div
              key={item.title}
              className="p-5 rounded-xl bg-[#FCFBF7] border border-[#EFE8D5]"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2
                  className="w-5 h-5 text-[#2E7D32] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="font-display text-lg font-semibold text-[#2C1E16]">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-[#5D4B41] leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section>
        <h2 className="font-display text-3xl font-bold text-[#2C1E16] mb-8">
          The People Behind Every Bottle
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TEAM.map((member) => (
            <article
              key={member.name}
              className="bg-white rounded-xl border border-[#E6DEC8] p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-[#E8F5E9] text-[#2E7D32] font-display text-lg font-bold flex items-center justify-center mb-4">
                {member.name
                  .split(' ')
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <h3 className="font-display text-xl font-semibold text-[#2C1E16]">
                {member.name}
              </h3>
              <p className="text-xs font-medium text-[#2E7D32] mt-0.5">{member.role}</p>
              <p className="mt-3 text-sm text-[#5D4B41] leading-relaxed">{member.bio}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
