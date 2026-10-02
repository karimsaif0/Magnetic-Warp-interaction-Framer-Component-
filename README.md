# Magnetic Warp — Framer Component

A fluid WebGL image interaction for Framer that makes images bend, pull, and respond to the cursor with a smooth magnetic distortion.

Built and customized for Framer by **Karim Saif**.

[![Live Preview](https://img.shields.io/badge/Live%20Preview-Magnetic%20Warp-111111?style=for-the-badge)](https://magneticwarp.framer.website/)
[![Framer Community](https://img.shields.io/badge/Framer-Community-0099FF?style=for-the-badge)](https://www.framer.com/community/posts/3R5CjSgX1Z1Ni5D7Y62Jh5/)

## ✨ Live Demo

**Preview:** https://magneticwarp.framer.website/

**Framer Community:** https://www.framer.com/community/posts/3R5CjSgX1Z1Ni5D7Y62Jh5/

**GitHub:** https://github.com/karimsaif0/Magnetic-Warp-interaction-Framer-Component-

## What Is Magnetic Warp?

Magnetic Warp turns a normal image into an interactive visual surface. As the pointer moves across the image, a localized displacement field follows the cursor and creates a soft, elastic magnetic warp.

The effect is rendered with Three.js and WebGL, while the displacement field is calculated on a compact grid for a responsive interaction that can be tuned directly from Framer.

## 🎯 Great For

- Creative portfolios
- Agency websites
- Interactive case studies
- Digital product websites
- SaaS landing pages
- Photography portfolios
- Fashion and editorial websites
- Art and culture websites
- Experimental web experiences
- Interactive hero sections
- Featured project cards
- Premium marketing pages

## ⚡ Features

- WebGL-powered image distortion
- Fluid cursor interaction
- Four built-in behavior presets
- Manual physics controls
- Adjustable magnetic strength
- Adjustable stiffness
- Adjustable damping
- Adjustable interaction radius
- WebGL quality control
- Responsive image support
- Cover-style image rendering
- Custom background color
- Custom corner radius
- Disable interaction when needed
- Reduced-motion support
- Static-renderer support
- ResizeObserver-based responsive sizing
- IntersectionObserver-based offscreen optimization
- WebGL context-loss handling
- Automatic Three.js resource cleanup
- Framer property controls with descriptions

## 🎛️ Presets

### Balanced

The default configuration with a versatile magnetic response. It also unlocks the manual controls.

### Soft

A lighter and more relaxed deformation for subtle interactions.

### Strong

A more noticeable magnetic response for bold interactive visuals.

### Wide

A broader interaction area that affects more of the image around the pointer.

## 🧩 Controls

| Control | Description |
| --- | --- |
| Image | Select the image that reacts to the magnetic cursor effect. |
| Preset | Choose Balanced, Soft, Strong, or Wide behavior. |
| Strength | Controls how far the image texture is pulled toward the pointer. |
| Stiffness | Controls how quickly the deformation responds. |
| Damping | Controls how smoothly the image settles after movement. |
| Radius | Controls the size of the magnetic interaction area. |
| Quality | Controls the maximum WebGL pixel density. |
| Disabled | Turns off the magnetic interaction. |
| Background | Sets the background behind the image. |
| Corner Radius | Controls the radius of the image container corners. |

## 🚀 Installation

1. Open your Framer project.
2. Add a Code Component.
3. Copy the contents of `MagneticWarp.tsx` into the component.
4. Make sure the project has access to `framer` and `three`.
5. Add an image through the Image property.
6. Choose a preset or fine-tune the Balanced settings.
7. Preview the page and move your cursor across the image.

## 🛠️ Customization

Magnetic Warp is designed to stay simple at the surface while giving you control over the interaction underneath.

Use the presets when you want a quick result. Switch to **Balanced** when you want to control the magnetic strength, stiffness, damping, and radius individually.

For performance-sensitive pages, lower the WebGL Quality setting. For larger or more detailed visuals, increase it when the target device can handle the additional rendering cost.

## ♿ Motion & Accessibility

The component respects reduced-motion preferences and avoids running the interactive animation when reduced motion is requested. Framer's static renderer is also detected so the component can provide a safe static representation outside the interactive runtime.

## ⚙️ Performance

Magnetic Warp uses a compact displacement grid rather than manipulating the full image geometry on every pointer movement. Rendering is paused when the component is outside the viewport, and WebGL resources are disposed when the component is removed or updated.

Performance can still vary by device, browser, image size, and the number of WebGL effects running on the same page. The Quality control provides a direct way to balance visual sharpness and GPU usage.

## 📁 Project Structure

```text
Magnetic-Warp-interaction-Framer-Component-
├── MagneticWarp.tsx
└── README.md
```

## 🔗 Links

- **Live Preview:** https://magneticwarp.framer.website/
- **Framer Community:** https://www.framer.com/community/posts/3R5CjSgX1Z1Ni5D7Y62Jh5/
- **GitHub Repository:** https://github.com/karimsaif0/Magnetic-Warp-interaction-Framer-Component-
- **X:** https://x.com/karimsaif0
- **Email:** karimsaif010@gmail.com

## 👤 Creator

**Karim Saif**

Framer designer and developer creating interactive components, WebGL experiences, and modern digital products.

X: https://x.com/karimsaif0

Email: karimsaif010@gmail.com

Made with 💛 by Karim Saif.
