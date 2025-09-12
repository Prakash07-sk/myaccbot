# MyACCOBot Design Guidelines

## Design Approach
**System-Based Approach**: Using Material Design principles for a professional desktop application with finance/accounting industry focus.

## Core Design Elements

### Color Palette
**Primary Colors:**
- Primary Blue: 210 85% 45% (Professional finance blue)
- Primary Green: 145 70% 40% (Accounting/money green)
- Background: 220 15% 8% (Dark charcoal)
- Surface: 220 12% 12% (Elevated surfaces)

**Supporting Colors:**
- Text Primary: 0 0% 95% (High contrast white)
- Text Secondary: 220 8% 70% (Muted text)
- Border: 220 15% 20% (Subtle borders)
- Success: 145 70% 50% (Confirmations)
- Warning: 35 85% 55% (Notifications)

### Typography
**Font Family:** Inter from Google Fonts
- Headings: Inter Bold (600-700 weight)
- Body: Inter Regular (400 weight)
- UI Elements: Inter Medium (500 weight)
- Code/Data: Inter Mono for file paths

### Layout System
**Spacing Units:** Tailwind units of 2, 4, 6, and 8
- Small gaps: p-2, m-2
- Standard spacing: p-4, m-4, gap-4
- Section spacing: p-6, m-6
- Large spacing: p-8, m-8

### Component Library

**Chat Interface:**
- Full-height chat container with dark background
- Message bubbles: User (primary blue), Bot (surface gray)
- Input bar: Fixed bottom with rounded corners, primary blue send button
- Dropdown menu: Material elevation with smooth slide-down animation

**Desktop Window:**
- Clean title bar with MyACCOBot logo
- Minimal window chrome following Electron conventions
- Consistent dark theme throughout

**Interactive Elements:**
- Primary buttons: Solid primary blue with white text
- Secondary buttons: Outline style with primary blue border
- Dropdown items: Hover state with subtle background change
- File browser: Native OS dialog integration

**Notifications:**
- Toast notifications: Top-right corner
- Success: Green background with white text
- Info: Blue background for "coming soon" messages
- Smooth fade-in/fade-out transitions

### Visual Treatments
**Professional Finance Aesthetic:**
- Clean, minimal interface prioritizing functionality
- Subtle shadows and elevations for depth
- Consistent border radius (6-8px) for modern feel
- High contrast for accessibility and professional appearance

**Animations:**
- Dropdown menus: 200ms ease-out slide animation
- Button interactions: Subtle scale (98%) on press
- Toast notifications: 300ms fade with slight slide-in
- NO distracting or excessive animations

### Images
**Logo Requirements:**
- MyACCOBot logo in header/title bar
- Style: Modern, finance-themed icon with text
- Placement: Top-left of window
- Format: SVG for scalability
- Theme: Incorporate calculator, chart, or document elements

**No Hero Image:** This is a utility desktop application focused on chat interface - no large hero images needed.

### Key Design Principles
1. **Professional First:** Clean, business-appropriate aesthetic
2. **Function Over Form:** Prioritize usability and efficiency
3. **Consistent Dark Theme:** Maintain dark mode throughout entire app
4. **Accessibility:** High contrast ratios and clear visual hierarchy
5. **Desktop Native:** Feel integrated with desktop environment