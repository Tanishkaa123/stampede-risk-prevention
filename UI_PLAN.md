# Stampede Avoidance System — UI Plan

## Design Philosophy

- **Human-first, not AI-looking**: No decorative blobs, no animated gradients, no "glassy" cards. Clean editorial style.
- **Minimal color**: Only use color where it carries meaning (red = danger, green = safe, yellow = caution).
- **High contrast**: Dark control-room UI for Admin/Superadmin. Light utility UI for public-facing pages.
- **No excess gradients**: Flat surfaces with thin borders and subtle shadows for depth.
- **Readable numbers**: Stats and counts use monospace / tabular figures for quick scanning.

---

## Color Tokens

| Token         | Value       | Usage                          |
|---------------|-------------|-------------------------------|
| `bg-base`     | `#0d0d0d`   | Admin/Superadmin background   |
| `bg-surface`  | `#161616`   | Cards in dark mode            |
| `bg-light`    | `#f7f6f2`   | Public pages background       |
| `bg-card-lt`  | `#ffffff`   | Cards in light mode           |
| `border-dark` | `#262626`   | Card borders (dark)           |
| `border-lt`   | `#e4e4e4`   | Card borders (light)          |
| `text-primary`| `#ebebeb`   | Main text (dark)              |
| `text-muted`  | `#888888`   | Secondary text                |
| `red-zone`    | `#dc2626`   | Danger / Red zone             |
| `yellow-zone` | `#d97706`   | Moderate / Yellow zone        |
| `green-zone`  | `#16a34a`   | Safe / Green zone             |
| `accent`      | `#e63946`   | Primary CTA buttons           |

---

## Typography

- **Font family**: Geist Sans (already in project)
- **Headings**: `font-semibold`, `tracking-tight`
- **Body**: `font-normal`, `leading-relaxed`
- **Stat numbers**: `font-mono`, `tabular-nums`
- **Labels/badges**: `text-xs uppercase tracking-widest`

---

## Page-by-Page Breakdown

---

### 1. Landing Page `/`

**Purpose**: First impression for the public and event organizers.

**Layout**: Single-column, sections stack vertically.

**Sections**:
1. **Navbar** — Logo left, nav links center, Login button right (solid red)
2. **Hero** — Headline in 2 lines, short subtitle, two CTA buttons (View Map / Login). Small status strip showing live zone counts.
3. **How It Works** — 3 horizontal cards with numbered steps. No icons, just bold numbers.
4. **Feature Grid** — 6 cards, 2 columns on mobile / 3 on desktop. Each card: title + paragraph only.
5. **Alert Strip** — Static red strip showing "How emergency alerts work"
6. **Footer** — Clean minimal: logo left, role login links right

**Color**: Light background `#f7f6f2`, black text, red accents.

---

### 2. Login Page `/login`

**Purpose**: Single login form for all roles.

**Layout**: Centered card on a dark or light split background.

**Sections**:
1. **Role Tab Switcher** — Three tabs: User / Administrator / Super Admin. Plain text tabs, bottom border active indicator, no pill/bubble.
2. **Form** — Email + Password field. Clean input with thin border. No floating labels.
3. **Submit Button** — Full width, solid red.
4. **Forgot password** — small link below button.

**Notes**: Role determines redirect after login. Supabase Auth handles authentication.

---

### 3. Live Map `/map`

**Purpose**: Show real-time crowd density zones to any user.

**Layout**: Full-screen map with overlay panel.

**Sections**:
1. **Top Bar** — Slim bar: "Live Crowd Map" + last updated timestamp + number of active alerts
2. **Map** — Leaflet map filling screen. Zones drawn as colored polygons (red/yellow/green). Markers for admin positions.
3. **Side Panel (right, collapsible)** — Zone list with density %. Search bar for zones. Toggle: Show/Hide admin markers.
4. **Legend** — Bottom-left overlay: three rows, color dot + label + description.
5. **Alert Popup** — If active alert: top-center red strip with dismiss.

**Color**: Map uses OSM tiles. Overlay UI on dark `#161616` card surfaces.

---

### 4. User Dashboard `/dashboard`

**Purpose**: Personal safety view for logged-in users.

**Layout**: 2-column on desktop, 1-column on mobile.

**Sections**:
1. **Status Bar** — "Your area: Zone A – 🔴 High Risk" full width banner
2. **My Location Card** — Current detected zone, density percentage, risk label
3. **Safe Route Suggestions** — 2–3 route cards. Each: Route name, travel time, crowd score, a colored "Safe / Risky" badge.
4. **Nearby Active Alerts** — List of alerts sorted by distance. Each: Alert type, zone, time ago.
5. **Zone Info Panel** — Density history (simple bar chart, CSS only, no JS charting library for MVP).

---

### 5. Admin Panel `/admin`

**Purpose**: Control room for ground administrators.

**Background**: Dark `#0d0d0d`

**Layout**: Left sidebar + main content area

**Sidebar**:
- System logo
- Nav: Overview / My Zone / Tasks / Alerts / Contacts / Reports
- User info + status indicator

**Main Sections**:
1. **My Zone Overview** — Zone name, current density, risk level badge. Large number: crowd count.
2. **Tasks** — Tabbed: Pending / Accepted / Completed. Each task card: instruction text, sender (Superadmin), time, Accept/Reject buttons.
3. **Contacts** — Table of nearby admins (name, zone, distance, online status, message button).
4. **Incident Reports** — Simple form: Zone, description, severity, submit.
5. **Alert Panel** — Incoming alerts with sound trigger badge.

---

### 6. Super Admin Panel `/superadmin`

**Purpose**: Full command center.

**Background**: Dark `#0d0d0d`

**Layout**: Top stats row + main 3-column grid

**Sections**:
1. **Stats Row** — 4 cards: Total active users, online admins, red zones, active alerts. Numbers large, monospace.
2. **Control Map** — Same Leaflet map, but with all admin positions, all zone statuses. Click zone → open zone editor panel.
3. **Zone Management Panel** — Select zone → update status, update density, assign admins.
4. **Broadcast** — Tab 1: Text broadcast (textarea + send to all / zone / group). Tab 2: Audio (record + send). Tab 3: Video (link or embed).
5. **Admins Overview** — Table: Admin name, zone, tasks assigned, completed, response time avg, performance score. Sortable.
6. **Analytics** — Zone density over time. Incident count. Alert breakdown. Simple CSS/JS-free bar charts using Tailwind div heights.

---

## Components Index

| Component              | File                             | Description                         |
|------------------------|----------------------------------|-------------------------------------|
| `Navbar`               | `components/Navbar.tsx`          | Public top nav                      |
| `AdminSidebar`         | `components/AdminSidebar.tsx`    | Dark sidebar for admin pages        |
| `ZoneBadge`            | `components/ZoneBadge.tsx`       | Red/Yellow/Green status pill        |
| `AlertBanner`          | `components/AlertBanner.tsx`     | Full-width emergency alert          |
| `TaskCard`             | `components/TaskCard.tsx`        | Admin task with accept/reject       |
| `StatCard`             | `components/StatCard.tsx`        | Number + label card for dashboards  |
| `CrowdMap`             | `components/CrowdMap.tsx`        | Leaflet map wrapper (client only)   |
| `RouteCard`            | `components/RouteCard.tsx`       | Safe route suggestion card          |
| `PerformanceTable`     | `components/PerformanceTable.tsx`| Admin performance ranking table     |
| `BroadcastPanel`       | `components/BroadcastPanel.tsx`  | Superadmin broadcast UI             |

---

## Responsive Breakpoints

| Breakpoint | Width   | Notes                                |
|------------|---------|--------------------------------------|
| Mobile     | < 640px | Single column, sidebar becomes drawer|
| Tablet     | 640–1024| 2 columns where applicable           |
| Desktop    | > 1024px| Full multi-column layouts            |

---

## What Not to Do

- No hero images with blur/opacity overlays
- No "glassmorphism" (backdrop-blur cards)
- No 5-stop gradient backgrounds
- No animated floating shapes or CSS blobs
- No emoji used as icons in actual UI (only in this doc)
- No placeholder lorem ipsum in the final build

---

## Supabase Integration Points

| Page            | Supabase Usage                                  |
|-----------------|-------------------------------------------------|
| Login           | `supabase.auth.signInWithPassword()`            |
| Map             | Realtime subscription on `zones` table          |
| Dashboard       | Read `zones`, `alerts` filtered by user zone    |
| Admin           | Read/write `tasks`, `incidents`, `zones`        |
| Superadmin      | Full CRUD on all tables, read `admin_metrics`   |
