"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Banner = {
  id: number;
  url: string;
};

type BannersResponse = {
  banners: Banner[];
};

const AUTOPLAY_TIME = 3000;
const DRAG_THRESHOLD = 60;

export default function HeroSection() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isDragging, setIsDragging] = useState(false);

  const sliderRef = useRef<HTMLDivElement>(null);

  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  /*
   * =========================
   * دریافت بنرها
   * =========================
   */

  useEffect(() => {
    let isMounted = true;

    async function fetchBanners() {
      try {
        const response = await fetch("/api/banners", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch banners");
        }

        const data: BannersResponse = await response.json();

        if (isMounted) {
          setBanners(
            Array.isArray(data.banners)
              ? data.banners
              : []
          );
        }
      } catch (error) {
        console.error(
          "Failed to fetch banners:",
          error
        );

        if (isMounted) {
          setBanners([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchBanners();

    return () => {
      isMounted = false;
    };
  }, []);

  /*
   * =========================
   * تغییر اسلاید
   * =========================
   */

  const goToSlide = useCallback(
    (index: number) => {
      if (banners.length === 0) return;

      let nextIndex = index;

      if (index < 0) {
        nextIndex = banners.length - 1;
      }

      if (index >= banners.length) {
        nextIndex = 0;
      }

      setCurrentIndex(nextIndex);
    },
    [banners.length]
  );

  const goNext = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const goPrevious = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  /*
   * =========================
   * Auto Play
   * =========================
   */

  const startAutoplay = useCallback(() => {
    if (banners.length <= 1) return;

    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
    }

    autoplayRef.current = setInterval(() => {
      setCurrentIndex((previous) => {
        return previous + 1 >= banners.length
          ? 0
          : previous + 1;
      });
    }, AUTOPLAY_TIME);
  }, [banners.length]);

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;

    startAutoplay();

    return () => {
      stopAutoplay();
    };
  }, [
    banners.length,
    startAutoplay,
    stopAutoplay,
  ]);

  /*
   * =========================
   * Drag / Swipe
   * =========================
   */

  const handlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (banners.length <= 1) return;

    setIsDragging(true);

    startXRef.current = event.clientX;
    currentXRef.current = event.clientX;

    stopAutoplay();

    event.currentTarget.setPointerCapture(
      event.pointerId
    );
  };

  const handlePointerMove = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!isDragging) return;

    currentXRef.current = event.clientX;
  };

  const handlePointerUp = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!isDragging) return;

    const distance =
      startXRef.current -
      currentXRef.current;

    setIsDragging(false);

    if (
      Math.abs(distance) >=
      DRAG_THRESHOLD
    ) {
      if (distance > 0) {
        goNext();
      } else {
        goPrevious();
      }
    }

    startAutoplay();

    try {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    } catch {}
  };

  const handlePointerCancel = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!isDragging) return;

    setIsDragging(false);
    startAutoplay();

    try {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    } catch {}
  };

  /*
   * =========================
   * Skeleton Loading
   * =========================
   */

  if (isLoading) {
    return (
      <section className="relative py-3 sm:py-5">
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-5 lg:px-8">
          <div
            className="
              relative
              h-[150px]
              overflow-hidden
              rounded-2xl
              bg-neutral-200
              sm:h-[200px]
              sm:rounded-3xl
              md:h-[270px]
              lg:h-[360px]
              xl:h-[380px]
            "
          >
            {/* Shimmer */}
            <div
              className="
                absolute
                inset-0
                -translate-x-full
                animate-[banner-shimmer_1.5s_infinite]
                bg-gradient-to-r
                from-transparent
                via-white/60
                to-transparent
              "
            />

            {/* Fake banner content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[65%] max-w-md space-y-3">
                <div className="mx-auto h-3 w-20 rounded-full bg-neutral-300 sm:h-4 sm:w-28" />

                <div className="h-5 w-full rounded-lg bg-neutral-300 sm:h-8" />

                <div className="mx-auto h-5 w-3/4 rounded-lg bg-neutral-300 sm:h-8" />

                <div className="mx-auto mt-4 h-7 w-20 rounded-lg bg-neutral-300 sm:h-10 sm:w-28" />
              </div>
            </div>
          </div>

          {/* Skeleton dots */}
          <div className="mt-3 flex justify-center gap-1.5">
            <div className="h-1.5 w-6 rounded-full bg-neutral-200" />
            <div className="h-1.5 w-1.5 rounded-full bg-neutral-200" />
            <div className="h-1.5 w-1.5 rounded-full bg-neutral-200" />
          </div>
        </div>
      </section>
    );
  }

  /*
   * =========================
   * اگر بنری وجود نداشت
   * Hero قبلی نمایش داده شود
   * =========================
   */

  if (banners.length === 0) {
    return (
      <section className="relative overflow-hidden">
        <div className="mx-auto flex min-h-[500px] max-w-7xl items-center justify-center px-5 py-16 text-center sm:min-h-[560px] sm:px-6 sm:py-20 lg:px-8">
          <div className="flex max-w-3xl flex-col items-center">
            <div className="mb-6 inline-flex items-center rounded-full bg-neutral-100 px-4 py-2 text-xs font-semibold text-neutral-600">
              نسل جدید تکنولوژی
            </div>

            <h1 className="text-4xl font-bold leading-[1.25] tracking-tight text-black sm:text-5xl lg:text-6xl">
              بهترین محصولات
              <br />
              <span className="text-neutral-400">
                دنیای تکنولوژی
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-neutral-500 sm:text-base">
              جدیدترین محصولات دیجیتال و گجت‌های روز را با
              تجربه‌ای ساده، سریع و مطمئن پیدا کنید.
              کیفیت، قیمت مناسب و تجربه خرید بهتر؛ همه در یک جا.
            </p>

            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <a
                href="#products"
                className="
                  rounded-xl
                  bg-black
                  px-6
                  py-3.5
                  text-sm
                  font-semibold
                  text-white
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-neutral-800
                  hover:shadow-lg
                  hover:shadow-black/10
                "
              >
                مشاهده محصولات
              </a>

              <a
                href="#categories"
                className="
                  rounded-xl
                  bg-neutral-100
                  px-6
                  py-3.5
                  text-sm
                  font-semibold
                  text-black
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-neutral-200
                "
              >
                دسته‌بندی‌ها
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /*
   * =========================
   * Banner Slider
   * =========================
   */

  return (
    <section className="relative py-3 sm:py-5">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-5 lg:px-8">
        <div
          ref={sliderRef}
          dir="ltr"
          className="
            relative
            w-full
            overflow-hidden
            rounded-2xl
            select-none
            sm:rounded-3xl
          "
          style={{
            touchAction: "pan-y",
            cursor: isDragging
              ? "grabbing"
              : banners.length > 1
                ? "grab"
                : "default",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onMouseEnter={stopAutoplay}
          onMouseLeave={() => {
            if (!isDragging) {
              startAutoplay();
            }
          }}
        >
          {/* Slides */}
          <div
            className="flex w-full"
            style={{
              transform: `translate3d(-${
                currentIndex * 100
              }%, 0, 0)`,

              transition: isDragging
                ? "none"
                : "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="
                  relative
                  min-w-full
                  h-[150px]
                  sm:h-[200px]
                  md:h-[270px]
                  lg:h-[360px]
                  xl:h-[380px]
                "
              >
                <img
                  src={banner.url}
                  alt="Banner"
                  draggable={false}
                  className="
                    absolute
                    inset-0
                    h-full
                    w-full
                    object-cover
                    object-center
                  "
                />

                {/* Subtle overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
              </div>
            ))}
          </div>

          {/* Previous */}
          {banners.length > 1 && (
            <button
              type="button"
              aria-label="بنر قبلی"
              onPointerDown={(event) => {
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.stopPropagation();
                goPrevious();
              }}
              className="
                absolute
                left-2
                top-1/2
                z-10
                flex
                h-8
                w-8
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-white/90
                text-black
                shadow-md
                backdrop-blur
                transition-all
                hover:scale-105
                hover:bg-white
                active:scale-95
                sm:left-4
                sm:h-10
                sm:w-10
              "
            >
              <ChevronLeft
                size={18}
                strokeWidth={2}
              />
            </button>
          )}

          {/* Next */}
          {banners.length > 1 && (
            <button
              type="button"
              aria-label="بنر بعدی"
              onPointerDown={(event) => {
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.stopPropagation();
                goNext();
              }}
              className="
                absolute
                right-2
                top-1/2
                z-10
                flex
                h-8
                w-8
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-white/90
                text-black
                shadow-md
                backdrop-blur
                transition-all
                hover:scale-105
                hover:bg-white
                active:scale-95
                sm:right-4
                sm:h-10
                sm:w-10
              "
            >
              <ChevronRight
                size={18}
                strokeWidth={2}
              />
            </button>
          )}
        </div>

        {/* Dots */}
        {banners.length > 1 && (
          <div
            dir="ltr"
            className="mt-3 flex justify-center gap-1.5"
          >
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                aria-label={`رفتن به بنر ${index + 1}`}
                onClick={() => {
                  goToSlide(index);
                  stopAutoplay();
                  startAutoplay();
                }}
                className={`
                  h-1.5
                  rounded-full
                  transition-all
                  duration-300
                  ${
                    currentIndex === index
                      ? "w-6 bg-black"
                      : "w-1.5 bg-neutral-300 hover:bg-neutral-500"
                  }
                `}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

