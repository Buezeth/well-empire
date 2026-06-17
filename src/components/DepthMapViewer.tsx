// src/components/DepthMapViewer.tsx
import React, { useEffect, useRef, useState } from 'react';

interface DepthMapViewerProps {
  image: string;
  depthImage: string;
  active: boolean;
  color: string;
}

const DepthMapViewer: React.FC<DepthMapViewerProps> = ({ image, depthImage, active, color }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const texturesRef = useRef<{ image: WebGLTexture | null; depth: WebGLTexture | null }>({ image: null, depth: null });
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const [aspectRatio, setAspectRatio] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use default premultipliedAlpha: true to match browser composite expectation
    const gl = canvas.getContext('webgl', { 
      alpha: true, 
      premultipliedAlpha: false,
      antialias: true 
    });
    if (!gl) {
      console.error('WebGL is not supported in this browser.');
      return;
    }
    glRef.current = gl;

    // Enable alpha blending and use the correct premultiplied blending function
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // Vertex Shader
    const vsSource = `
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        vUv.y = 1.0 - vUv.y;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment Shader: Smooths boundaries and outputs premultiplied alpha
    const fsSource = `
      precision mediump float;
      varying vec2 vUv;
      uniform sampler2D uImage;
      uniform sampler2D uDepth;
      uniform vec2 uOffset;
      
      float getSmoothedDepth(vec2 uv) {
        float depthSum = 0.0;
        const float blurStep = 0.022;
        
        depthSum += texture2D(uDepth, uv + vec2(-blurStep, -blurStep)).r;
        depthSum += texture2D(uDepth, uv + vec2(0.0, -blurStep)).r;
        depthSum += texture2D(uDepth, uv + vec2(blurStep, -blurStep)).r;
        depthSum += texture2D(uDepth, uv + vec2(-blurStep, 0.0)).r;
        depthSum += texture2D(uDepth, uv + vec2(0.0, 0.0)).r;
        depthSum += texture2D(uDepth, uv + vec2(blurStep, 0.0)).r;
        depthSum += texture2D(uDepth, uv + vec2(-blurStep, blurStep)).r;
        depthSum += texture2D(uDepth, uv + vec2(0.0, blurStep)).r;
        depthSum += texture2D(uDepth, uv + vec2(blurStep, blurStep)).r;
        
        return depthSum / 9.0;
      }

      void main() {
        // Sample original image to establish layout boundary
        vec4 originalColor = texture2D(uImage, vUv);
        
        float depth = getSmoothedDepth(vUv);
        
        // Scale down coordinate shifting at the transparent margins
        float edgeDamp = originalColor.a * originalColor.a;
        vec2 displacement = uOffset * (depth * 0.035) * edgeDamp;
        
        vec4 color = texture2D(uImage, vUv + displacement);
        
        // Clean anti-aliased alpha boundary
        color.a = min(color.a, originalColor.a);
        
        // Output premultiplied alpha (RGB multiplied by alpha) to match the WebGL compositor settings
        gl_FragColor = vec4(color.rgb * color.a, color.a);
      }
    `;

    const compileShader = (source: string, type: number) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(vsSource, gl.VERTEX_SHADER);
    const fs = compileShader(fsSource, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }
    programRef.current = program;

    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const createTexture = () => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      return tex;
    };

    const imageTex = createTexture();
    const depthTex = createTexture();
    texturesRef.current = { image: imageTex, depth: depthTex };

    const loadTextureImage = (url: string, texture: WebGLTexture) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
          if (texture === imageTex) {
            setAspectRatio(img.width / img.height);
          }
          resolve();
        };
        img.src = url;
      });
    };

    Promise.all([
      loadTextureImage(image, imageTex!),
      loadTextureImage(depthImage, depthTex!)
    ]).then(() => {
      render();
    });

    // ResizeObserver tracks actual visual bounds on layout or ratio changes
    const resizeObserver = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width > 0 && height > 0) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    });
    resizeObserver.observe(canvas);

    const render = (time = 0) => {
      const t = time * 0.0012; 
      const targetX = Math.sin(t) * 0.15;
      const targetY = Math.cos(t * 1.3) * 0.06;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texturesRef.current.image);
      gl.uniform1i(gl.getUniformLocation(program, 'uImage'), 0);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, texturesRef.current.depth);
      gl.uniform1i(gl.getUniformLocation(program, 'uDepth'), 1);

      gl.uniform2f(gl.getUniformLocation(program, 'uOffset'), targetX, targetY);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      requestRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      resizeObserver.disconnect();
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      gl.deleteBuffer(buffer);
      gl.deleteTexture(imageTex);
      gl.deleteTexture(depthTex);
      gl.deleteProgram(program);
    };
  }, [image, depthImage]);

  return (
    <div 
      className="absolute inset-0 m-auto max-w-full max-h-full pointer-events-none"
      style={{ aspectRatio: `${aspectRatio}` }}
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full pointer-events-none block"
      />
    </div>
  );
};

export default DepthMapViewer;