// components/Features.tsx
import React from 'react';
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  RefreshCw,
  Clock,
} from 'lucide-react';

const features = [
  // {
  //   id: 1,
  //   title: 'خرید قسطی',
  //   subtitle: 'اعتبار و اقساط با دیجی‌پی',
  //   icon: ShoppingBag,
  // },
  {
    id: 1,
    title: 'اصالت کالا',
    subtitle: 'واردات مستقیم و ضمانت کیفیت',
    icon: ShieldCheck,
  },
  {
    id: 2,
    title: 'ارسال سراسری',
    subtitle: 'تهران سریع، شهرستان با تیپ‌اکس',
    icon: Truck,
  },
  // {
  //   id: 4,
  //   title: 'مرجوعی آسان',
  //   subtitle: 'تعویض در صورت ایراد فنی',
  //   icon: RefreshCw,
  // },
  {
    id: 3,
    title: '۲۵ سال تجربه',
    subtitle: 'واردات از چین و دبی',
    icon: Clock,
  },
];

export default function Features() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* استفاده از flex به جای grid برای وسط چین شدن همیشگی هر تعداد آیتم */}
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-10">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`
                flex flex-col items-center text-center group
                ${index === 4 ? 'w-full md:w-auto' : ''}
              `}
            >
              <div className="text-gray-700 group-hover:text-blue-600 transition-colors duration-300">
                <feature.icon className="w-6 h-6 md:w-7 md:h-7" strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-medium text-gray-800 mt-3">
                {feature.title}
              </h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed max-w-[140px] md:max-w-none">
                {feature.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}