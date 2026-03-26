import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";

function calculateGap(width) {
  const minWidth = 1024;
  const maxWidth = 1456;
  const minGap = 60;
  const maxGap = 86;

  if (width <= minWidth) return minGap;
  if (width >= maxWidth) {
    return Math.max(minGap, maxGap + 0.06018 * (width - maxWidth));
  }

  return minGap + (maxGap - minGap) * ((width - minWidth) / (maxWidth - minWidth));
}

export function CircularTestimonials({
  testimonials,
  autoplay = true,
  colors = {},
  fontSizes = {},
}) {
  const colorName = colors.name ?? "#102569";
  const colorDesignation = colors.designation ?? "#5a667d";
  const colorTestimony = colors.testimony ?? "#0d172d";
  const colorArrowBg = colors.arrowBackground ?? "#102569";
  const colorArrowFg = colors.arrowForeground ?? "#f7fafe";
  const colorArrowHoverBg = colors.arrowHoverBackground ?? "#2f56c1";
  const fontSizeName = fontSizes.name ?? "1.7rem";
  const fontSizeDesignation = fontSizes.designation ?? "0.95rem";
  const fontSizeQuote = fontSizes.quote ?? "1.08rem";

  const safeTestimonials = useMemo(
    () => (Array.isArray(testimonials) ? testimonials : []),
    [testimonials],
  );
  const testimonialsLength = safeTestimonials.length;

  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverPrev, setHoverPrev] = useState(false);
  const [hoverNext, setHoverNext] = useState(false);
  const [containerWidth, setContainerWidth] = useState(1200);

  const imageContainerRef = useRef(null);
  const autoplayIntervalRef = useRef(null);

  const activeTestimonial = useMemo(() => {
    if (!testimonialsLength) return null;
    return safeTestimonials[activeIndex];
  }, [activeIndex, safeTestimonials, testimonialsLength]);

  useEffect(() => {
    if (!testimonialsLength) return;

    const limitedIndex = activeIndex % testimonialsLength;
    if (activeIndex !== limitedIndex) {
      setActiveIndex(limitedIndex);
    }
  }, [activeIndex, testimonialsLength]);

  useEffect(() => {
    function handleResize() {
      if (imageContainerRef.current) {
        setContainerWidth(imageContainerRef.current.offsetWidth);
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!autoplay || testimonialsLength < 2) return undefined;

    autoplayIntervalRef.current = setInterval(() => {
      setActiveIndex((previous) => (previous + 1) % testimonialsLength);
    }, 5000);

    return () => {
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
      }
    };
  }, [autoplay, testimonialsLength]);

  const handleNext = useCallback(() => {
    if (!testimonialsLength) return;
    setActiveIndex((previous) => (previous + 1) % testimonialsLength);
    if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current);
  }, [testimonialsLength]);

  const handlePrev = useCallback(() => {
    if (!testimonialsLength) return;
    setActiveIndex((previous) => (previous - 1 + testimonialsLength) % testimonialsLength);
    if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current);
  }, [testimonialsLength]);

  useEffect(() => {
    if (!testimonialsLength) return undefined;

    const handleKey = (event) => {
      if (event.key === "ArrowLeft") handlePrev();
      if (event.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleNext, handlePrev, testimonialsLength]);

  function getImageStyle(index) {
    const gap = calculateGap(containerWidth);
    const maxStickUp = gap * 0.8;
    const isActive = index === activeIndex;
    const isLeft = (activeIndex - 1 + testimonialsLength) % testimonialsLength === index;
    const isRight = (activeIndex + 1) % testimonialsLength === index;

    if (isActive) {
      return {
        zIndex: 3,
        opacity: 1,
        pointerEvents: "auto",
        transform: "translateX(0px) translateY(0px) scale(1) rotateY(0deg)",
        transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
      };
    }

    if (isLeft) {
      return {
        zIndex: 2,
        opacity: 1,
        pointerEvents: "auto",
        transform: `translateX(-${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(15deg)`,
        transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
      };
    }

    if (isRight) {
      return {
        zIndex: 2,
        opacity: 1,
        pointerEvents: "auto",
        transform: `translateX(${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(-15deg)`,
        transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
      };
    }

    return {
      zIndex: 1,
      opacity: 0,
      pointerEvents: "none",
      transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
    };
  }

  const quoteVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  if (!activeTestimonial) return null;

  return (
    <div className="ml-circular-testimonials">
      <div className="ml-circular-testimonials__grid">
        <div className="ml-circular-testimonials__image-container" ref={imageContainerRef}>
          {safeTestimonials.map((testimonial, index) => (
            <img
              key={testimonial.src}
              src={testimonial.src}
              alt={testimonial.name}
              className="ml-circular-testimonials__image"
              style={getImageStyle(index)}
              loading="lazy"
            />
          ))}
        </div>

        <div className="ml-circular-testimonials__content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              variants={quoteVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <h3
                className="ml-circular-testimonials__name"
                style={{ color: colorName, fontSize: fontSizeName }}
              >
                {activeTestimonial.name}
              </h3>
              <p
                className="ml-circular-testimonials__designation"
                style={{ color: colorDesignation, fontSize: fontSizeDesignation }}
              >
                {activeTestimonial.designation}
              </p>
              <motion.p
                className="ml-circular-testimonials__quote"
                style={{ color: colorTestimony, fontSize: fontSizeQuote }}
              >
                {activeTestimonial.quote.split(" ").map((word, index) => (
                  <motion.span
                    key={`${word}-${index}`}
                    initial={{ filter: "blur(10px)", opacity: 0, y: 5 }}
                    animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.22,
                      ease: "easeInOut",
                      delay: 0.025 * index,
                    }}
                    className="ml-circular-testimonials__word"
                  >
                    {word}&nbsp;
                  </motion.span>
                ))}
              </motion.p>
            </motion.div>
          </AnimatePresence>

          <div className="ml-circular-testimonials__arrow-buttons">
            <button
              className="ml-circular-testimonials__arrow-button"
              onClick={handlePrev}
              style={{ backgroundColor: hoverPrev ? colorArrowHoverBg : colorArrowBg }}
              onMouseEnter={() => setHoverPrev(true)}
              onMouseLeave={() => setHoverPrev(false)}
              aria-label="Anterior"
              type="button"
            >
              <FaArrowLeft size={18} color={colorArrowFg} />
            </button>
            <button
              className="ml-circular-testimonials__arrow-button"
              onClick={handleNext}
              style={{ backgroundColor: hoverNext ? colorArrowHoverBg : colorArrowBg }}
              onMouseEnter={() => setHoverNext(true)}
              onMouseLeave={() => setHoverNext(false)}
              aria-label="Proximo"
              type="button"
            >
              <FaArrowRight size={18} color={colorArrowFg} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CircularTestimonials;
