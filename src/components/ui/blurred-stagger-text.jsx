import React from "react";
import { motion } from "motion/react";

export function BlurredStagger({ text = "we love hextaui.com", className = "" }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
      },
    },
  };

  const letterAnimation = {
    hidden: {
      opacity: 0,
      filter: "blur(10px)",
    },
    show: {
      opacity: 1,
      filter: "blur(0px)",
    },
  };

  return (
    <motion.h1 variants={container} initial="hidden" animate="show" className={className}>
      {text.split("").map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          variants={letterAnimation}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.h1>
  );
}

export default BlurredStagger;
