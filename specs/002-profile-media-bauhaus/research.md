# Research: Profile, Media & Bauhaus Design

## 1. Image Upload & Camera Capture in Next.js

### Decision: Use native HTML5 File API + Supabase Storage

### Rationale
- HTML5 `<input type="file" accept="image/*" capture="environment">` provides camera access on mobile
- No additional dependencies needed for basic camera/gallery functionality
- Supabase Storage integrates seamlessly with existing auth (RLS for storage buckets)
- Browser-based image compression before upload reduces storage costs and load times

### Alternatives Considered
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| react-webcam | More control over camera | Extra dependency, complex for simple use case | Rejected |
| Native File API | Zero dependencies, works everywhere | Less control | **Chosen** |
| Cloudinary/ImageKit | Advanced transformations | Adds external dependency, cost | Rejected |

### Implementation Pattern
```typescript
// Camera capture on mobile, file picker on desktop
<input 
  type="file" 
  accept="image/*" 
  capture="environment"  // Back camera on mobile
  onChange={handleImageSelect}
/>
```

---

## 2. Client-Side Image Compression

### Decision: Use browser-image-compression library

### Rationale
- Lightweight (~7KB gzipped)
- Supports WebP output for smaller files
- Maintains EXIF orientation
- Target: < 500KB, 1200px max dimension

### Alternatives Considered
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| browser-image-compression | Lightweight, well-maintained | Extra dependency | **Chosen** |
| Canvas API (manual) | Zero dependencies | Complex, EXIF handling manual | Rejected |
| Server-side compression | Offload work | Higher bandwidth, slower UX | Rejected |

### Configuration
```typescript
const options = {
  maxSizeMB: 0.5,           // 500KB max
  maxWidthOrHeight: 1200,   // Max dimension
  useWebWorker: true,       // Non-blocking
  fileType: 'image/webp',   // Modern format
  initialQuality: 0.8,      // Good balance
}
```

---

## 3. Supabase Storage Buckets

### Decision: Two buckets - `avatars` (public) and `item-images` (private)

### Rationale
- Avatars need public URLs for display in header (no auth check per request)
- Item images should be private (household-scoped via RLS)
- Separate buckets allow different policies

### Bucket Configuration
```sql
-- avatars bucket: Public read, authenticated write
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- item-images bucket: Private, RLS enforced
INSERT INTO storage.buckets (id, name, public) VALUES ('item-images', 'item-images', false);
```

### RLS Policies
- Avatars: Users can upload/delete their own avatar
- Item images: Household members can upload/view/delete within household

---

## 4. Animation Library for Bauhaus Theme

### Decision: Framer Motion

### Rationale
- Best-in-class React animation library
- Declarative API fits React paradigm
- Built-in gesture support
- Respects `prefers-reduced-motion` via `useReducedMotion` hook
- Already widely used, excellent docs

### Alternatives Considered
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Framer Motion | Declarative, powerful | 30KB bundle | **Chosen** |
| CSS-only animations | Zero JS overhead | Limited, harder to orchestrate | Partial use |
| react-spring | Physics-based | Steeper learning curve | Rejected |
| GSAP | Industry standard | Larger, imperative API | Rejected |

### Accessibility Pattern
```typescript
const shouldReduceMotion = useReducedMotion()

<motion.div
  animate={{ scale: shouldReduceMotion ? 1 : [1, 1.05, 1] }}
  transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
/>
```

---

## 5. Bauhaus Design System

### Decision: Custom Tailwind theme with CSS variables

### Rationale
- Tailwind already in use - extend, don't replace
- CSS variables allow theme-wide changes
- Geometric patterns via CSS/SVG (no images needed)

### Color Palette (from spec assumptions)
```css
:root {
  --bauhaus-red: #E53935;
  --bauhaus-blue: #1E88E5;
  --bauhaus-yellow: #FDD835;
  --bauhaus-black: #212121;
  --bauhaus-white: #FAFAFA;
}
```

### Typography
- Primary: Inter (already using via Geist)
- Headers: Consider DM Sans or Space Grotesk for geometric feel
- Key: Strong weight contrast (300 vs 700)

### Design Patterns
1. **Geometric backgrounds**: CSS gradients + `clip-path` for triangles/circles
2. **Bold borders**: 3-4px solid black on cards
3. **Color blocking**: Large solid color sections
4. **Asymmetric layouts**: CSS Grid with intentional imbalance
5. **Micro-interactions**: Scale, rotate, color shift on hover

---

## 6. Type/Tag System Design

### Decision: Junction table pattern with auto-assigned colors

### Rationale
- Many-to-many: Items can have multiple types, types apply to multiple items
- Colors from predefined palette ensure visual harmony
- Household-scoped types (not global)

### Color Assignment
```typescript
const TYPE_COLORS = [
  '#E53935', '#1E88E5', '#FDD835', // Bauhaus primaries
  '#43A047', '#8E24AA', '#FB8C00', // Extended palette
  '#00ACC1', '#7CB342', '#F4511E',
]

// Assign color based on hash of type name (deterministic)
function getTypeColor(typeName: string): string {
  const hash = typeName.split('').reduce((acc, char) => 
    acc + char.charCodeAt(0), 0)
  return TYPE_COLORS[hash % TYPE_COLORS.length]
}
```

---

## 7. Preserving Existing Features

### Decision: Additive changes only, comprehensive regression testing

### Strategy
1. **Database**: New columns with defaults, new tables only - no breaking changes
2. **Components**: New props optional, existing behavior preserved
3. **Tests**: Run full test suite before and after each phase
4. **Feature flags**: Consider `NEXT_PUBLIC_BAUHAUS_THEME` for gradual rollout

### Regression Checklist
- [ ] All existing unit tests pass
- [ ] All existing integration tests pass
- [ ] All existing E2E tests pass
- [ ] Search functionality works with new item card layout
- [ ] QR code generation/scanning works
- [ ] Box CRUD works
- [ ] Item CRUD works
- [ ] Authentication flow works
- [ ] Real-time sync works

---

## 8. Easter Eggs Ideas

### Decision: 3 hidden interactions (per FR-023)

1. **Logo spin**: Click logo 3x rapidly → logo spins 360° with Bauhaus color trail
2. **Konami code**: ↑↑↓↓←→←→BA → Brief geometric explosion animation
3. **Secret palette**: Long-press on any colored element → shows Bauhaus color info tooltip

### Implementation
- Track click counts with `useRef` (no re-renders)
- Use `useEffect` cleanup to reset counters
- Easter eggs are purely visual, no functional impact

