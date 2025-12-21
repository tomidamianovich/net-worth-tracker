# Design System

This design system provides CSS custom properties (variables) for consistent styling across the application.

## Usage

Import the design system in your CSS files:

```css
@import "../styles/design-system.css";
```

Or ensure it's imported once in your main CSS file (already done in `App.css`).

## Variables Reference

### Colors

#### Primary Colors
- `--color-primary`: Main brand color (#007aff)
- `--color-primary-hover`: Primary hover state (#0051d5)
- `--color-primary-light`: Light primary background (#e3f2fd)
- `--color-primary-dark`: Dark primary variant (#1976d2)

#### Secondary Colors
- `--color-secondary`: Secondary brand color (#2196f3)
- `--color-secondary-hover`: Secondary hover state (#1976d2)

#### Semantic Colors
- `--color-success`: Success/green color (#4caf50)
- `--color-error`: Error/red color (#f44336)
- `--color-warning`: Warning/orange color (#ff9800)

#### Text Colors
- `--color-text-primary`: Main text color (#1a1a1a)
- `--color-text-secondary`: Secondary text (#1d1d1f)
- `--color-text-muted`: Muted text (#666)
- `--color-text-light`: Light text (#86868b)
- `--color-text-disabled`: Disabled text (#999)

#### Background Colors
- `--color-bg-primary`: White background (#ffffff)
- `--color-bg-secondary`: Light gray background (#f5f5f5)
- `--color-bg-tertiary`: Lighter gray (#f9f9f9)
- `--color-bg-hover`: Hover background (#fafafa)
- `--color-bg-active`: Active background (#e8e8e8)

#### Border Colors
- `--color-border-light`: Light border (#e0e0e0)
- `--color-border-medium`: Medium border (#d1d1d6)
- `--color-border-dark`: Dark border (#ccc)

### Spacing

Use spacing variables for consistent padding and margins:

- `--spacing-xs`: 4px
- `--spacing-sm`: 8px
- `--spacing-md`: 12px
- `--spacing-lg`: 16px
- `--spacing-xl`: 20px
- `--spacing-2xl`: 24px
- `--spacing-3xl`: 30px
- `--spacing-4xl`: 32px
- `--spacing-5xl`: 40px
- `--spacing-6xl`: 48px
- `--spacing-7xl`: 80px

**Example:**
```css
.card {
  padding: var(--spacing-lg) var(--spacing-2xl);
  margin-bottom: var(--spacing-xl);
}
```

### Typography

#### Font Sizes
- `--font-size-xs`: 10px
- `--font-size-sm`: 12px
- `--font-size-base`: 14px
- `--font-size-md`: 15px
- `--font-size-lg`: 16px
- `--font-size-xl`: 18px
- `--font-size-2xl`: 20px
- `--font-size-3xl`: 24px
- `--font-size-4xl`: 32px
- `--font-size-5xl`: 42px

#### Font Weights
- `--font-weight-normal`: 400
- `--font-weight-medium`: 500
- `--font-weight-semibold`: 600
- `--font-weight-bold`: 700

#### Line Heights
- `--line-height-tight`: 1.2
- `--line-height-normal`: 1.3
- `--line-height-relaxed`: 1.4
- `--line-height-loose`: 1.5

#### Letter Spacing
- `--letter-spacing-tight`: -0.04em
- `--letter-spacing-normal`: -0.02em
- `--letter-spacing-relaxed`: -0.01em
- `--letter-spacing-wide`: 0.5px
- `--letter-spacing-wider`: 0.8px

**Example:**
```css
.heading {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-normal);
}
```

### Border Radius

- `--radius-xs`: 3px
- `--radius-sm`: 4px
- `--radius-md`: 6px
- `--radius-lg`: 8px
- `--radius-xl`: 12px
- `--radius-2xl`: 16px
- `--radius-full`: 50% (for circles)

**Example:**
```css
.button {
  border-radius: var(--radius-lg);
}

.avatar {
  border-radius: var(--radius-full);
}
```

### Shadows

- `--shadow-sm`: Small shadow
- `--shadow-md`: Medium shadow
- `--shadow-lg`: Large shadow
- `--shadow-xl`: Extra large shadow
- `--shadow-primary`: Primary color shadow
- `--shadow-primary-hover`: Primary hover shadow

**Example:**
```css
.card {
  box-shadow: var(--shadow-md);
}

.card:hover {
  box-shadow: var(--shadow-lg);
}
```

### Transitions

- `--transition-fast`: 0.15s
- `--transition-base`: 0.2s
- `--transition-slow`: 0.3s
- `--transition-all`: Shorthand for `all var(--transition-base)`

**Example:**
```css
.button {
  transition: var(--transition-all);
}
```

### Z-Index

- `--z-index-dropdown`: 100
- `--z-index-sticky`: 200
- `--z-index-modal-backdrop`: 1000
- `--z-index-modal`: 1001
- `--z-index-popover`: 1100
- `--z-index-tooltip`: 1200

**Example:**
```css
.modal {
  z-index: var(--z-index-modal);
}
```

## Migration Guide

When updating existing CSS files to use the design system:

1. Replace hardcoded colors with color variables
2. Replace hardcoded spacing values with spacing variables
3. Replace hardcoded font sizes/weights with typography variables
4. Replace hardcoded border-radius values with radius variables
5. Replace hardcoded shadows with shadow variables

**Before:**
```css
.button {
  padding: 12px 24px;
  background-color: #007aff;
  color: white;
  border-radius: 8px;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
```

**After:**
```css
.button {
  padding: var(--spacing-md) var(--spacing-2xl);
  background-color: var(--color-primary);
  color: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  box-shadow: var(--shadow-md);
}
```

## Benefits

- **Consistency**: Ensures consistent styling across all components
- **Maintainability**: Change values in one place to update the entire app
- **Theme Support**: Easy to add dark mode or custom themes
- **Type Safety**: Reduces typos and incorrect values
- **Scalability**: Easy to add new variables as the design system grows

