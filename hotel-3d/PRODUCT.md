# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router) + React + TypeScript; React Three Fiber + Drei + GLSL; GSAP + ScrollTrigger; Framer Motion; Lenis; Tailwind CSS. Pinned by the brief. Lives in `hotel-3d/` inside the BuildWebAI repo, independent from the static agency site.

## Users

International couples aged 30 to 55, high income, planning a winter (and summer) stay in the Alps. They browse on desktop in the evening and on phone while travelling, compare a few top Courchevel addresses, and want to feel the place before they book.

## Product Purpose

Showcase site for L'Arolle, a fictional five-star boutique hotel in Courchevel 1850. It tells a stay as a story, from arrival to departure, and ends on a direct booking request (dates, guests). Success: the visitor understands the place in one viewport and sends a booking request.

## Positioning

A small house (24 suites) rather than a palace: intimacy, stone-pine wood (arolle), the silence of altitude. Inferred, to confirm: the name and the arolle material are invented by Claude for this demo.

## Operating Context

Demo built by BuildWebAI to show prospects an award-level hotel site. Booking is a request form, not a live booking engine.

## Capabilities and Constraints

- 24 suites (four suite types shown: Arête, Lauze, Combe, Cembro), spa with indoor pool, restaurant, tailored experiences (offer chosen by the user).
- Ski-in / ski-out and the Courchevel 1850 location are assumptions of the demo.
- 60 fps target, Lighthouse > 85, lazy-loaded 3D, lighter mobile version.
- No real prices, awards, press quotes or reviews: none exist and none may be invented.

## Brand Commitments

Name "L'Arolle" and the "A-pente" monogram (didone A whose crossbar follows the 12° slope) are approved by the user. Brief: luxury = restraint, lots of space, strong editorial serif with a thin sans, palette taken from the place; no purple gradients, no stock rounded cards, no emojis.

## Evidence on Hand

- Client-supplied AI-generated videos of the house (entrance, living room, four suites, restaurant, pool), used as scroll sequences (`public/sequences/`), ambient loops (`public/video/`) and stills (`public/images/lieu-*`, `suite-*`, `table-*`, `spa-*`). They depict the intended house, not a photographed real building.
- Two experience images are Unsplash photos (credited in `public/images/CREDITS.md`).
- Suite names, sizes and amenities, opening hours, address, phone and e-mail are demo content to confirm. No prices, awards, press or reviews exist; none may be invented.

## Product Principles

1. The scroll tells a stay, not a brochure.
2. Restraint over spectacle: every effect earns its place.
3. The place leads; the interface recedes.
4. Booking is always one gesture away.

## Accessibility & Inclusion

WCAG AA contrast, full keyboard navigation, alt text, `prefers-reduced-motion` cuts or reduces all motion.
