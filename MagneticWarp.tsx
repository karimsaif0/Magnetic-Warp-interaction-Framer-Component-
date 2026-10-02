/**
 * Made with 💛 by Karim Saif
 * Created and customized for Framer by Karim Saif
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 800
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */

import * as React from "react"
import {
    addPropertyControls,
    ControlType,
    useIsStaticRenderer,
    useReducedMotion,
} from "framer"
import * as THREE from "three"

const GRID = 44

type Preset = "Balanced" | "Soft" | "Strong" | "Wide"

interface ResponsiveImageValue {
    src?: string
    srcSet?: string
    alt?: string
}

interface MagneticWarpProps {
    image?: ResponsiveImageValue
    preset: Preset
    strength: number
    stiffness: number
    damping: number
    radius: number
    quality: number
    disabled: boolean
    backgroundColor: string
    borderRadius: number
}

const PRESETS = {
    Balanced: {
        strength: 0.07,
        stiffness: 0.1,
        damping: 0.84,
        radius: 0.32,
    },
    Soft: {
        strength: 0.045,
        stiffness: 0.075,
        damping: 0.88,
        radius: 0.38,
    },
    Strong: {
        strength: 0.12,
        stiffness: 0.14,
        damping: 0.8,
        radius: 0.28,
    },
    Wide: {
        strength: 0.06,
        stiffness: 0.085,
        damping: 0.86,
        radius: 0.5,
    },
}

export default function KarimSaifMagneticWarp(props: MagneticWarpProps) {
    const {
        image,
        preset = "Balanced",
        strength = 0.07,
        stiffness = 0.1,
        damping = 0.84,
        radius = 0.32,
        quality = 1.5,
        disabled = false,
        backgroundColor = "#111111",
        borderRadius = 0,
    } = props

    const containerRef = React.useRef<HTMLDivElement>(null)

    const isStatic = useIsStaticRenderer()
    const prefersReducedMotion = useReducedMotion()

    const imageSrc = image?.src || ""

    const effectValues = React.useMemo(() => {
        if (preset === "Balanced") {
            return {
                strength,
                stiffness,
                damping,
                radius,
            }
        }

        return PRESETS[preset]
    }, [preset, strength, stiffness, damping, radius])

    React.useEffect(() => {
        const container = containerRef.current

        if (!container || !imageSrc || isStatic || disabled || prefersReducedMotion) {
            return
        }

        let disposed = false
        let raf = 0
        let renderer: THREE.WebGLRenderer | null = null
        let texture: THREE.Texture | null = null
        let dataTexture: THREE.DataTexture | null = null
        let geometry: THREE.PlaneGeometry | null = null
        let material: THREE.ShaderMaterial | null = null
        let mesh: THREE.Mesh | null = null
        let resizeObserver: ResizeObserver | null = null
        let intersectionObserver: IntersectionObserver | null = null
        let canvas: HTMLCanvasElement | null = null

        try {
            renderer = new THREE.WebGLRenderer({
                alpha: true,
                antialias: true,
                powerPreference: "high-performance",
            })

            const pixelRatio = Math.min(
                Math.max(window.devicePixelRatio || 1, 1),
                quality
            )

            renderer.setPixelRatio(pixelRatio)
            renderer.setClearColor(0x000000, 0)

            canvas = renderer.domElement
            canvas.style.width = "100%"
            canvas.style.height = "100%"
            canvas.style.display = "block"
            canvas.style.position = "absolute"
            canvas.style.inset = "0"
            canvas.style.touchAction = "none"

            container.appendChild(canvas)

            const scene = new THREE.Scene()
            const camera = new THREE.Camera()

            geometry = new THREE.PlaneGeometry(2, 2)

            const displacementData = new Float32Array(GRID * GRID * 4)
            const velocityData = new Float32Array(GRID * GRID * 2)

            dataTexture = new THREE.DataTexture(
                displacementData,
                GRID,
                GRID,
                THREE.RGBAFormat,
                THREE.FloatType
            )

            dataTexture.needsUpdate = true
            dataTexture.minFilter = THREE.NearestFilter
            dataTexture.magFilter = THREE.NearestFilter
            dataTexture.wrapS = THREE.ClampToEdgeWrapping
            dataTexture.wrapT = THREE.ClampToEdgeWrapping

            texture = new THREE.TextureLoader().load(imageSrc)
            texture.minFilter = THREE.LinearFilter
            texture.magFilter = THREE.LinearFilter
            texture.wrapS = THREE.ClampToEdgeWrapping
            texture.wrapT = THREE.ClampToEdgeWrapping

            const uniforms = {
                uTexture: { value: texture },
                uDataTexture: { value: dataTexture },
                uResolution: { value: new THREE.Vector2(1, 1) },
                uImageResolution: { value: new THREE.Vector2(1, 1) },
                uStrength: { value: effectValues.strength },
            }

            material = new THREE.ShaderMaterial({
                transparent: true,
                depthWrite: false,
                depthTest: false,
                uniforms,
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = vec4(position.xy, 0.0, 1.0);
                    }
                `,
                fragmentShader: `
                    precision highp float;
                    uniform sampler2D uTexture;
                    uniform sampler2D uDataTexture;
                    uniform vec2 uResolution;
                    uniform vec2 uImageResolution;
                    uniform float uStrength;
                    varying vec2 vUv;

                    vec2 coverUV(vec2 uv) {
                        float screenAspect = uResolution.x / max(uResolution.y, 1.0);
                        float imageAspect = uImageResolution.x / max(uImageResolution.y, 1.0);
                        vec2 scale = vec2(1.0);

                        if (screenAspect > imageAspect) {
                            scale.y = imageAspect / screenAspect;
                        } else {
                            scale.x = screenAspect / imageAspect;
                        }

                        return (uv - 0.5) * scale + 0.5;
                    }

                    void main() {
                        vec2 offset = texture2D(uDataTexture, vUv).rg;
                        vec2 uv = coverUV(vUv) - offset * uStrength;
                        uv = clamp(uv, vec2(0.001), vec2(0.999));
                        gl_FragColor = texture2D(uTexture, uv);
                    }
                `,
            })

            mesh = new THREE.Mesh(geometry, material)
            scene.add(mesh)

            const mouse = { x: 0.5, y: 0.5 }
            let pointerActive = false

            const handlePointerMove = (event: PointerEvent) => {
                if (!canvas) return

                const rect = canvas.getBoundingClientRect()
                if (rect.width <= 0 || rect.height <= 0) return

                mouse.x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
                mouse.y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))
                pointerActive = true
            }

            const handlePointerLeave = () => {
                pointerActive = false
            }

            canvas.addEventListener("pointermove", handlePointerMove)
            canvas.addEventListener("pointerleave", handlePointerLeave)

            const handleContextLost = (event: Event) => {
                event.preventDefault()
            }

            canvas.addEventListener("webglcontextlost", handleContextLost)

            const updateDisplacement = () => {
                if (!dataTexture) return

                const gx = GRID * mouse.x
                const gy = GRID * (1 - mouse.y)
                const radiusCells = effectValues.radius * GRID
                const radiusSquared = radiusCells * radiusCells

                for (let y = 0; y < GRID; y++) {
                    for (let x = 0; x < GRID; x++) {
                        const index = x + GRID * y
                        const dataIndex = index * 4
                        const velocityIndex = index * 2

                        let targetX = 0
                        let targetY = 0

                        if (pointerActive) {
                            const dx = gx - x
                            const dy = gy - y
                            const distanceSquared = dx * dx + dy * dy

                            if (distanceSquared < radiusSquared) {
                                const distance = Math.sqrt(distanceSquared) + 0.0001
                                const normalized = Math.max(0, 1 - distance / radiusCells)
                                const influence = normalized * normalized * (3 - 2 * normalized)
                                targetX = (dx / distance) * influence
                                targetY = -(dy / distance) * influence
                            }
                        }

                        const accelerationX =
                            (targetX - displacementData[dataIndex]) * effectValues.stiffness
                        const accelerationY =
                            (targetY - displacementData[dataIndex + 1]) * effectValues.stiffness

                        velocityData[velocityIndex] =
                            (velocityData[velocityIndex] + accelerationX) * effectValues.damping
                        velocityData[velocityIndex + 1] =
                            (velocityData[velocityIndex + 1] + accelerationY) * effectValues.damping

                        displacementData[dataIndex] += velocityData[velocityIndex]
                        displacementData[dataIndex + 1] += velocityData[velocityIndex + 1]
                    }
                }

                dataTexture.needsUpdate = true
            }

            const resize = () => {
                if (!renderer) return

                const width = container.clientWidth
                const height = container.clientHeight
                if (width <= 0 || height <= 0) return

                renderer.setSize(width, height, false)

                const ratio = Math.min(
                    Math.max(window.devicePixelRatio || 1, 1),
                    quality
                )

                uniforms.uResolution.value.set(width * ratio, height * ratio)
            }

            resize()
            resizeObserver = new ResizeObserver(resize)
            resizeObserver.observe(container)

            let visible = true

            intersectionObserver = new IntersectionObserver(
                (entries) => {
                    visible = entries[0]?.isIntersecting ?? false
                },
                { rootMargin: "200px", threshold: 0 }
            )

            intersectionObserver.observe(container)

            const render = () => {
                if (disposed || !renderer) return

                if (texture?.image && texture.image.width && texture.image.height) {
                    uniforms.uImageResolution.value.set(
                        texture.image.width,
                        texture.image.height
                    )
                }

                updateDisplacement()
                renderer.render(scene, camera)
            }

            const animate = () => {
                if (disposed) return

                raf = requestAnimationFrame(animate)
                if (!visible) return

                render()
            }

            animate()

            return () => {
                disposed = true
                cancelAnimationFrame(raf)

                resizeObserver?.disconnect()
                intersectionObserver?.disconnect()

                canvas?.removeEventListener("pointermove", handlePointerMove)
                canvas?.removeEventListener("pointerleave", handlePointerLeave)
                canvas?.removeEventListener("webglcontextlost", handleContextLost)

                if (mesh) scene.remove(mesh)
                texture?.dispose()
                dataTexture?.dispose()
                geometry?.dispose()
                material?.dispose()

                if (renderer) {
                    renderer.dispose()
                    try {
                        renderer.forceContextLoss()
                    } catch {}
                }

                if (canvas?.parentNode === container) {
                    container.removeChild(canvas)
                }
            }
        } catch {
            if (canvas?.parentNode === container) {
                container.removeChild(canvas)
            }

            texture?.dispose()
            dataTexture?.dispose()
            geometry?.dispose()
            material?.dispose()
            renderer?.dispose()
        }

        return () => {
            disposed = true
            cancelAnimationFrame(raf)
            resizeObserver?.disconnect()
            intersectionObserver?.disconnect()
        }
    }, [
        imageSrc,
        preset,
        effectValues,
        quality,
        disabled,
        isStatic,
        prefersReducedMotion,
    ])

    return (
        <div
            ref={containerRef}
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                backgroundColor,
                borderRadius,
            }}
        >
            {imageSrc && (
                <img
                    src={imageSrc}
                    srcSet={image?.srcSet}
                    alt={image?.alt || ""}
                    draggable={false}
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        userSelect: "none",
                        pointerEvents: "none",
                    }}
                />
            )}
        </div>
    )
}

KarimSaifMagneticWarp.defaultProps = {
    image: {
        src: "",
        alt: "",
    },
    preset: "Balanced",
    strength: 0.07,
    stiffness: 0.1,
    damping: 0.84,
    radius: 0.32,
    quality: 1.5,
    disabled: false,
    backgroundColor: "#111111",
    borderRadius: 0,
}

addPropertyControls(KarimSaifMagneticWarp, {
    image: {
        type: ControlType.ResponsiveImage,
        title: "Image",
        description: "Select the image that will react to the magnetic cursor effect.",
    },
    preset: {
        type: ControlType.Enum,
        title: "Preset",
        options: ["Balanced", "Soft", "Strong", "Wide"],
        optionTitles: ["Balanced", "Soft", "Strong", "Wide"],
        defaultValue: "Balanced",
        displaySegmentedControl: true,
        description: "Choose a ready-made magnetic behavior. Use Balanced to customize the effect manually.",
    },
    strength: {
        type: ControlType.Number,
        title: "Strength",
        min: 0,
        max: 0.16,
        step: 0.005,
        defaultValue: 0.07,
        hidden: (props) => props.preset !== "Balanced",
        description: "Controls how far the image texture is pulled toward the pointer.",
    },
    stiffness: {
        type: ControlType.Number,
        title: "Stiffness",
        min: 0.02,
        max: 0.3,
        step: 0.005,
        defaultValue: 0.1,
        hidden: (props) => props.preset !== "Balanced",
        description: "Controls how quickly the magnetic deformation responds to cursor movement.",
    },
    damping: {
        type: ControlType.Number,
        title: "Damping",
        min: 0.7,
        max: 0.95,
        step: 0.005,
        defaultValue: 0.84,
        hidden: (props) => props.preset !== "Balanced",
        description: "Controls how smoothly the image settles back after the pointer moves away.",
    },
    radius: {
        type: ControlType.Number,
        title: "Radius",
        min: 0.1,
        max: 0.6,
        step: 0.01,
        defaultValue: 0.32,
        hidden: (props) => props.preset !== "Balanced",
        description: "Controls the size of the area affected around the pointer.",
    },
    quality: {
        type: ControlType.Number,
        title: "Quality",
        min: 1,
        max: 2,
        step: 0.25,
        defaultValue: 1.5,
        description: "Controls the maximum WebGL pixel density. Higher values look sharper but use more GPU resources.",
    },
    disabled: {
        type: ControlType.Boolean,
        title: "Disabled",
        defaultValue: false,
        description: "Disables the magnetic interaction and leaves the image static.",
    },
    backgroundColor: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: "#111111",
        description: "Sets the background behind the image while the WebGL effect initializes.",
    },
    borderRadius: {
        type: ControlType.Number,
        title: "Corner Radius",
        min: 0,
        max: 200,
        step: 1,
        defaultValue: 0,
        description: "Controls the corner radius applied to the image container.",
    },
})
