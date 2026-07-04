# Moataz AI — Design System & Theme Engine

This document defines the visual layout, components specification, and theme configurations for the Moataz AI user interface. All visual elements are coordinated through custom CSS properties to guarantee responsiveness, readability, accessibility, and RTL support.

---

## 1. Core Visual Tokens

Our styling palette is built around HSL variables, ensuring consistent contrast and seamless swapping between Light and Dark modes.

### Color Palette Architecture

```css
/* Core HSL Variable Scheme (Base Theme) */
:root {
  --background: 220 14% 96%;        /* Sleek light grey-blue */
  --foreground: 224 71.4% 4.1%;     /* Dark slate */
  
  --card: 0 0% 100%;                /* Pure white */
  --card-foreground: 224 71.4% 4.1%;

  --popover: 0 0% 100%;
  --popover-foreground: 224 71.4% 4.1%;

  --primary: 220 80% 50%;           /* Premium tech blue */
  --primary-foreground: 210 20% 98%;

  --secondary: 220 14.3% 90%;       /* Muted grey-blue */
  --secondary-foreground: 220.9 39.3% 11%;

  --muted: 220 14.3% 95.9%;
  --muted-foreground: 220 8.9% 46.1%;

  --accent: 220 14.3% 90%;
  --accent-foreground: 220.9 39.3% 11%;

  --destructive: 0 84.2% 60.2%;     /* Warning/Error red */
  --destructive-foreground: 210 20% 98%;

  --border: 220 13% 91%;
  --input: 220 13% 91%;
  --ring: 220 80% 50%;

  --radius: 0.75rem;                /* Premium rounded look */
}

.dark {
  --background: 224 71.4% 4.1%;     /* Deep space black */
  --foreground: 210 20% 98%;        /* Soft white text */

  --card: 224 71.4% 8%;             /* Deep obsidian card */
  --card-foreground: 210 20% 98%;

  --popover: 224 71.4% 8%;
  --popover-foreground: 210 20% 98%;

  --primary: 220 85% 55%;           /* Vibrant tech blue */
  --primary-foreground: 210 20% 98%;

  --secondary: 215 27.9% 16.9%;
  --secondary-foreground: 210 20% 98%;

  --muted: 215 27.9% 16.9%;
  --muted-foreground: 215 20.2% 65.1%;

  --accent: 215 27.9% 16.9%;
  --accent-foreground: 210 20% 98%;

  --destructive: 0 62.8% 50.6%;
  --destructive-foreground: 210 20% 98%;

  --border: 215 27.9% 16.9%;
  --input: 215 27.9% 16.9%;
  --ring: 220 85% 55%;
}
```

### Typography Scale
We utilize modern, legible type scales configured in standard classes:
*   **Headings**: Outfit (or Inter), bold/semibold, with tight letter-spacing (`tracking-tight`).
*   **Body**: Inter, normal, line-height 1.5 (`leading-relaxed`).
*   **Code**: Fira Code, with monospace styling.

| Token | CSS Class | Size (Rem) | Weight | Line Height |
| :--- | :--- | :--- | :--- | :--- |
| Title Large | `text-4xl` | `2.25rem` | `700 (Bold)` | `1.2` |
| Title Medium | `text-2xl` | `1.5rem` | `600 (Semibold)` | `1.25` |
| Subheading | `text-lg` | `1.125rem` | `500 (Medium)` | `1.4` |
| Body Text | `text-base` | `1rem` | `400 (Regular)` | `1.5` |
| Muted Detail | `text-sm` | `0.875rem` | `400 (Regular)` | `1.4` |

### Spacing & Grid System
*   **Base Unit**: 4px grid (`1rem = 16px`).
*   **Layout Spacers**: `gap-4` (16px), `gap-6` (24px), `gap-8` (32px).
*   **Page Margins**: Mobile: `px-4`, Tablet: `px-6`, Desktop: `px-8` (capped at max-width `1440px`).

---

## 2. Component Design & Layout Contracts

All UI elements must support:
1.  Keyboard Navigation (focus-ring attributes: `focus-visible:ring-2 focus-visible:ring-ring`).
2.  High Contrast Dark Mode.
3.  Micro-Transitions (hover:scale or fade transformations).

### Component Layout Blueprints

*   **Buttons**:
    *   *Primary*: Gradient backgrounds, light text, with `hover:brightness-105 active:scale-95 transition-all`.
    *   *Secondary/Outline*: Border `1px solid var(--border)` with neutral hover overlays.
*   **Inputs**:
    *   Rounded `var(--radius)`, background `hsl(var(--card))`, focus state highlighting `var(--ring)` with a subtle outer glow shadow.
*   **Cards**:
    *   Structured with padding `p-6`, borders `1px solid var(--border)`, and smooth hover shadow offsets.
*   **Skeletons & Loading States**:
    *   Pulsing state animation (`animate-pulse-gentle`) using neutral shades `bg-muted`.

---

## 3. Dynamic Internationalization Engine (Arabic & English)

Moataz AI is natively dual-language (English LTR and Arabic RTL).

### i18n Contract Strategy
No hardcoded text strings are permitted in UI components. All translations are referenced from structured locale maps.

```typescript
// File: src/shared/types/i18n.types.ts
export type SupportedLocale = 'en' | 'ar';

export interface ITranslationCatalog {
  common: {
    save: string;
    cancel: string;
    error: string;
    loading: string;
  };
  navigation: {
    dashboard: string;
    settings: string;
    chat: string;
  };
  settings: {
    apiKeyTitle: string;
    themeLabel: string;
    languageLabel: string;
  };
}
```

### RTL Layout Execution
We use Tailwind's logical directions classes (e.g. `start`, `end`, `ms-*`, `me-*`, `flex-row-reverse`) combined with the HTML `dir` attribute:
*   When English is active: `<html lang="en" dir="ltr">`
*   When Arabic is active: `<html lang="ar" dir="rtl">`

```tsx
// Core Layout Direction Wrapping Pattern
import React from 'react';
import { SupportedLocale } from '@shared/types/i18n.types';

interface ILocaleProviderProps {
  locale: SupportedLocale;
  children: React.ReactNode;
}

export function LocaleProvider({ locale, children }: ILocaleProviderProps) {
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  
  return (
    <div dir={direction} className={locale === 'ar' ? 'font-arabic' : 'font-sans'}>
      {children}
    </div>
  );
}
```
*Note: In future phases, translation catalogues will be located under `public/locales/[locale].json` and dynamically loaded to prevent bloated client bundle sizes.*
