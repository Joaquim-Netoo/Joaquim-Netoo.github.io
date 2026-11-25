import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin, CustomEase);

// Mesmas curvas de --ease-out / --ease-in-out (tokens.css)
CustomEase.create("out", "0.23, 1, 0.32, 1");
CustomEase.create("inOut", "0.77, 0, 0.175, 1");

gsap.defaults({ ease: "out", duration: 0.56 });

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isTouch(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(hover: none), (pointer: coarse)").matches;
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
