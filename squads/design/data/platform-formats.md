# Platform-Specific Token Format Examples

**ID:** platform-formats
**Version:** 1.0
**Purpose:** Reference showing how the same design token is expressed across different platform-specific output formats
**Maintained By:** @jina-anne

---

## Source Token (DTCG Format)

The single source of truth for each token is defined in the W3C Design Tokens Community Group (DTCG) format:

```json
{
  "color": {
    "brand": {
      "primary": {
        "$value": "#2563EB",
        "$type": "color",
        "$description": "Primary brand color used for key actions and emphasis"
      }
    }
  },
  "spacing": {
    "md": {
      "$value": "16px",
      "$type": "dimension",
      "$description": "Medium spacing unit, default for component padding"
    }
  },
  "font": {
    "family": {
      "body": {
        "$value": "'Inter', sans-serif",
        "$type": "fontFamily",
        "$description": "Primary typeface for body text and UI elements"
      }
    },
    "size": {
      "md": {
        "$value": "1rem",
        "$type": "dimension",
        "$description": "Base font size for body text"
      }
    }
  },
  "shadow": {
    "elevation": {
      "2": {
        "$value": {
          "offsetX": "0px",
          "offsetY": "4px",
          "blur": "6px",
          "spread": "0px",
          "color": "rgba(0, 0, 0, 0.1)"
        },
        "$type": "shadow",
        "$description": "Medium elevation shadow for dropdowns and floating elements"
      }
    }
  }
}
```

---

## CSS Custom Properties

```css
:root {
  /* Colors */
  --color-brand-primary: #2563EB;

  /* Spacing */
  --spacing-md: 16px;

  /* Typography */
  --font-family-body: 'Inter', sans-serif;
  --font-size-md: 1rem;

  /* Shadows */
  --shadow-elevation-2: 0 4px 6px rgba(0, 0, 0, 0.1);

  /* Borders */
  --border-radius-md: 8px;
  --border-width-thin: 1px;
}
```

**Usage:**
```css
.button-primary {
  background-color: var(--color-brand-primary);
  padding: var(--spacing-md);
  font-family: var(--font-family-body);
  font-size: var(--font-size-md);
  box-shadow: var(--shadow-elevation-2);
  border-radius: var(--border-radius-md);
}
```

---

## SCSS Variables

```scss
// Colors
$color-brand-primary: #2563EB;

// Spacing
$spacing-md: 16px;

// Typography
$font-family-body: 'Inter', sans-serif;
$font-size-md: 1rem;

// Shadows
$shadow-elevation-2: 0 4px 6px rgba(0, 0, 0, 0.1);

// Borders
$border-radius-md: 8px;
$border-width-thin: 1px;
```

**Usage:**
```scss
.button-primary {
  background-color: $color-brand-primary;
  padding: $spacing-md;
  font-family: $font-family-body;
  font-size: $font-size-md;
  box-shadow: $shadow-elevation-2;
  border-radius: $border-radius-md;
}
```

---

## JSON (JavaScript / TypeScript)

```json
{
  "color": {
    "brand": {
      "primary": "#2563EB"
    }
  },
  "spacing": {
    "md": "16px"
  },
  "font": {
    "family": {
      "body": "'Inter', sans-serif"
    },
    "size": {
      "md": "1rem"
    }
  },
  "shadow": {
    "elevation": {
      "2": "0 4px 6px rgba(0, 0, 0, 0.1)"
    }
  },
  "border": {
    "radius": {
      "md": "8px"
    }
  }
}
```

**Usage (JavaScript):**
```javascript
import tokens from './tokens.json';

const styles = {
  backgroundColor: tokens.color.brand.primary,
  padding: tokens.spacing.md,
  fontFamily: tokens.font.family.body,
};
```

---

## iOS Swift (UIKit)

```swift
import UIKit

public enum DesignTokens {
    // Colors
    public static let colorBrandPrimary = UIColor(red: 37/255, green: 99/255, blue: 235/255, alpha: 1.0)

    // Spacing
    public static let spacingMd: CGFloat = 16.0

    // Typography
    public static let fontFamilyBody = "Inter"
    public static let fontSizeMd: CGFloat = 16.0

    // Shadows
    public static func shadowElevation2(for layer: CALayer) {
        layer.shadowColor = UIColor.black.cgColor
        layer.shadowOpacity = 0.1
        layer.shadowOffset = CGSize(width: 0, height: 4)
        layer.shadowRadius = 6
    }

    // Borders
    public static let borderRadiusMd: CGFloat = 8.0
}
```

**Usage:**
```swift
button.backgroundColor = DesignTokens.colorBrandPrimary
button.contentEdgeInsets = UIEdgeInsets(
    top: DesignTokens.spacingMd,
    left: DesignTokens.spacingMd,
    bottom: DesignTokens.spacingMd,
    right: DesignTokens.spacingMd
)
button.layer.cornerRadius = DesignTokens.borderRadiusMd
```

---

## Android XML

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Colors -->
    <color name="color_brand_primary">#2563EB</color>

    <!-- Spacing -->
    <dimen name="spacing_md">16dp</dimen>

    <!-- Typography -->
    <string name="font_family_body">inter</string>
    <dimen name="font_size_md">16sp</dimen>

    <!-- Borders -->
    <dimen name="border_radius_md">8dp</dimen>
    <dimen name="border_width_thin">1dp</dimen>
</resources>
```

**Usage (XML Layout):**
```xml
<Button
    android:background="@color/color_brand_primary"
    android:padding="@dimen/spacing_md"
    android:fontFamily="@string/font_family_body"
    android:textSize="@dimen/font_size_md" />
```

---

## React Native

```typescript
export const tokens = {
  color: {
    brand: {
      primary: '#2563EB',
    },
  },
  spacing: {
    md: 16,
  },
  font: {
    family: {
      body: 'Inter',
    },
    size: {
      md: 16,
    },
  },
  shadow: {
    elevation2: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3, // Android
    },
  },
  border: {
    radius: {
      md: 8,
    },
  },
};
```

**Usage:**
```typescript
import { tokens } from './tokens';

const styles = StyleSheet.create({
  button: {
    backgroundColor: tokens.color.brand.primary,
    padding: tokens.spacing.md,
    borderRadius: tokens.border.radius.md,
    ...tokens.shadow.elevation2,
  },
});
```

---

## Flutter Dart

```dart
class DesignTokens {
  // Colors
  static const Color colorBrandPrimary = Color(0xFF2563EB);

  // Spacing
  static const double spacingMd = 16.0;

  // Typography
  static const String fontFamilyBody = 'Inter';
  static const double fontSizeMd = 16.0;

  // Shadows
  static List<BoxShadow> shadowElevation2 = [
    BoxShadow(
      color: Colors.black.withOpacity(0.1),
      offset: const Offset(0, 4),
      blurRadius: 6,
      spreadRadius: 0,
    ),
  ];

  // Borders
  static const double borderRadiusMd = 8.0;
}
```

**Usage:**
```dart
Container(
  decoration: BoxDecoration(
    color: DesignTokens.colorBrandPrimary,
    borderRadius: BorderRadius.circular(DesignTokens.borderRadiusMd),
    boxShadow: DesignTokens.shadowElevation2,
  ),
  padding: EdgeInsets.all(DesignTokens.spacingMd),
  child: Text(
    'Button',
    style: TextStyle(
      fontFamily: DesignTokens.fontFamilyBody,
      fontSize: DesignTokens.fontSizeMd,
    ),
  ),
)
```

---

## Style Dictionary Configuration

```json
{
  "source": ["tokens/**/*.json"],
  "platforms": {
    "css": {
      "transformGroup": "css",
      "buildPath": "build/css/",
      "files": [{ "destination": "tokens.css", "format": "css/variables" }]
    },
    "scss": {
      "transformGroup": "scss",
      "buildPath": "build/scss/",
      "files": [{ "destination": "_tokens.scss", "format": "scss/variables" }]
    },
    "js": {
      "transformGroup": "js",
      "buildPath": "build/js/",
      "files": [{ "destination": "tokens.json", "format": "json/flat" }]
    },
    "ios-swift": {
      "transformGroup": "ios-swift",
      "buildPath": "build/ios/",
      "files": [{ "destination": "DesignTokens.swift", "format": "ios-swift/class.swift" }]
    },
    "android": {
      "transformGroup": "android",
      "buildPath": "build/android/",
      "files": [{ "destination": "tokens.xml", "format": "android/resources" }]
    }
  }
}
```
