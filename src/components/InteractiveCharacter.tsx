import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useCharacterEngine } from '../context/CharacterEngine';

interface InteractiveCharacterProps {
  variant?: 'hero' | 'companion' | 'contact';
  className?: string;
}

// Vertex shader for full-quad video/poster chroma-key pass
const VERTEX_SHADER_SRC = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`;

// Fragment shader tailored to exact cyan backdrop rgb(98, 226, 229) with smooth anti-aliased edges + despill
const FRAGMENT_SHADER_SRC = `
  precision mediump float;
  uniform sampler2D u_texture;
  varying vec2 v_texCoord;

  void main() {
    vec4 color = texture2D(u_texture, v_texCoord);
    // Key color from uploaded studio cyan backdrop: (98/255, 226/255, 229/255)
    vec3 keyColor = vec3(0.384, 0.886, 0.898);

    // Measure color difference weighted heavily toward cyan hue/chroma
    float diff = distance(color.rgb, keyColor);

    // Ensure non-cyan tones (skin, hair, purple bag/bow, green apple, yellow/orange ruler) stay solid
    float cyanStrength = ((color.g + color.b) * 0.5) - color.r;
    float isBackdrop = smoothstep(0.14, 0.27, diff);
    float alpha = max(isBackdrop, 1.0 - smoothstep(0.24, 0.40, cyanStrength));

    // Subtle edge despill to remove cyan fringe along curly hair & sneakers
    vec3 rgb = color.rgb;
    if (alpha < 0.98 && cyanStrength > 0.15) {
      float avgGB = (rgb.g + rgb.b) * 0.5;
      float spill = max(0.0, avgGB - max(rgb.r, 0.42));
      rgb.g -= spill * 0.45;
      rgb.b -= spill * 0.45;
    }

    // Softly discard fully transparent background pixels
    gl_FragColor = vec4(rgb * alpha, alpha);
  }
`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export const InteractiveCharacter: React.FC<InteractiveCharacterProps> = ({
  variant = 'hero',
  className = '',
}) => {
  const {
    videoRef,
    posterImage,
    videoReady,
    posterReady,
    behavior,
    reactionLabel,
    triggerReaction,
    pointerRef,
    setHoveringCharacter,
    setNearCharacter,
    reducedMotion,
    isLowPower,
  } = useCharacterEngine();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const shadowRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Subtle GSAP pointer-tracking & reaction choreography
  useEffect(() => {
    const stage = stageRef.current;
    const shadow = shadowRef.current;
    if (!stage || reducedMotion) return;

    const xTo = gsap.quickTo(stage, 'x', { duration: 0.45, ease: 'power3.out' });
    const yTo = gsap.quickTo(stage, 'y', { duration: 0.45, ease: 'power3.out' });
    const rotYTo = gsap.quickTo(stage, 'rotationY', { duration: 0.5, ease: 'power3.out' });
    const rotXTo = gsap.quickTo(stage, 'rotationX', { duration: 0.5, ease: 'power3.out' });
    const scaleTo = gsap.quickTo(stage, 'scale', { duration: 0.4, ease: 'power2.out' });
    const shadowXTo = shadow ? gsap.quickTo(shadow, 'x', { duration: 0.45, ease: 'power3.out' }) : null;

    let rafId = 0;
    const maxShiftX = variant === 'hero' ? 14 : 8;
    const maxShiftY = variant === 'hero' ? 9 : 5;
    const maxTilt = variant === 'hero' ? 6.5 : 4.5;

    const updateTransform = () => {
      const p = pointerRef.current;
      // Check proximity on hero / stage element
      if (containerRef.current && variant === 'hero') {
        const rect = containerRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const cursorX = ((p.x + 1) / 2) * window.innerWidth;
        const cursorY = ((p.y + 1) / 2) * window.innerHeight;
        const dist = Math.hypot(cursorX - cx, cursorY - cy);
        setNearCharacter(dist < Math.max(rect.width, rect.height) * 0.72);
      }

      xTo(p.x * maxShiftX);
      yTo(p.y * maxShiftY);
      rotYTo(p.x * maxTilt);
      rotXTo(-p.y * (maxTilt * 0.65));
      scaleTo(p.isHoveringCharacter ? 1.035 : p.isNearCharacter ? 1.015 : 1);
      if (shadowXTo) shadowXTo(p.x * (maxShiftX * 0.7));

      rafId = window.requestAnimationFrame(updateTransform);
    };

    rafId = window.requestAnimationFrame(updateTransform);
    return () => window.cancelAnimationFrame(rafId);
  }, [pointerRef, reducedMotion, setNearCharacter, variant]);

  // Subtle celebratory pulse when behavior shifts into showcase/stride
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || reducedMotion) return;
    if (behavior === 'showcase_supply' || behavior === 'pack_stride') {
      gsap.fromTo(
        stage,
        { y: -4 },
        { y: 0, duration: 0.45, ease: 'back.out(2)', overwrite: 'auto' }
      );
    }
  }, [behavior, reducedMotion]);

  // WebGL chroma-key rendering loop (with 2D fallback)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = 960;
    const height = 540;
    canvas.width = width;
    canvas.height = height;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });

    if (!gl) {
      // Clean 2D fallback
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      let raf = 0;
      const draw2d = () => {
        const video = videoRef.current;
        const source = videoReady && video && video.readyState >= 2 ? video : posterImage;
        if (source) {
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(source, 0, 0, width, height);
        }
        if (!reducedMotion) {
          raf = window.requestAnimationFrame(draw2d);
        }
      };
      draw2d();
      return () => window.cancelAnimationFrame(raf);
    }

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionLoc = gl.getAttribLocation(program, 'a_position');
    const texCoordLoc = gl.getAttribLocation(program, 'a_texCoord');

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const texBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(texCoordLoc);
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.viewport(0, 0, width, height);

    let rafId = 0;
    let lastDraw = 0;
    const frameInterval = isLowPower ? 1000 / 24 : 1000 / 30;
    let uploadedPoster = false;

    const renderFrame = (now: number) => {
      if (now - lastDraw >= frameInterval || !uploadedPoster) {
        lastDraw = now;
        const video = videoRef.current;
        const useVideo = Boolean(videoReady && video && video.readyState >= 2);
        const source = useVideo ? video : posterReady ? posterImage : null;

        if (source) {
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
          uploadedPoster = true;
        }
      }

      if (!reducedMotion) {
        rafId = window.requestAnimationFrame(renderFrame);
      }
    };

    rafId = window.requestAnimationFrame(renderFrame);

    return () => {
      window.cancelAnimationFrame(rafId);
      gl.deleteTexture(texture);
      gl.deleteBuffer(posBuffer);
      gl.deleteBuffer(texBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [isLowPower, posterImage, posterReady, reducedMotion, videoReady, videoRef]);

  const handleCharacterClick = () => {
    if (behavior === 'showcase_supply') {
      triggerReaction('pack_stride', 2200, 'Ready for class!');
    } else {
      triggerReaction('showcase_supply', 2400, 'Checking school supplies!');
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative select-none ${className}`}
      style={{ perspective: '1000px' }}
      onMouseEnter={() => setHoveringCharacter(true)}
      onMouseLeave={() => setHoveringCharacter(false)}
    >
      {/* Interactive Stage */}
      <div
        ref={stageRef}
        onClick={handleCharacterClick}
        role="button"
        tabIndex={0}
        aria-label="Interactive schoolbag character — click to see her inspect supplies or pack up"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCharacterClick();
          }
        }}
        className="group relative cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 rounded-3xl"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <canvas
          ref={canvasRef}
          className="block h-auto w-full object-contain drop-shadow-[0_18px_28px_rgba(24,22,34,0.10)]"
        />

        {/* Subtle grounded floor shadow */}
        <div
          ref={shadowRef}
          aria-hidden="true"
          className="mx-auto -mt-4 h-4 w-[58%] rounded-[100%] bg-ink/12 blur-md transition-opacity duration-300 group-hover:opacity-80"
        />
      </div>

      {/* Subtle contextual reaction caption when directly triggered */}
      {reactionLabel && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none absolute right-4 top-3 rounded-lg border border-border-hairline bg-surface/95 px-3 py-1.5 text-xs font-medium text-ink shadow-sm backdrop-blur-sm"
        >
          {reactionLabel}
        </div>
      )}
    </div>
  );
};
