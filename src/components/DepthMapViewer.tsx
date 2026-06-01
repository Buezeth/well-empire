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

    // Use premultipliedAlpha: false to correctly render PNG straight transparency
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

    // Enable WebGL alpha blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Vertex Shader
    const vsSource = `
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        vUv.y = 1.0 - vUv.y; // Match standard texture coordinates
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment Shader
    const fsSource = `
      precision mediump float;
      varying vec2 vUv;
      uniform sampler2D uImage;
      uniform sampler2D uDepth;
      uniform vec2 uOffset;
      
      void main() {
        // Sample depth map
        float depth = texture2D(uDepth, vUv).r;
        
        // Calculate displacement offset
        vec2 displacement = uOffset * (depth * 0.06);
        
        // Sample image color at displaced coordinates
        vec4 color = texture2D(uImage, vUv + displacement);
        
        // Hard discard of transparent pixels to prevent rectangular bounding box artifact
        if (color.a < 0.05) {
          discard;
        }
        
        gl_FragColor = color;
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

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = (time = 0) => {
      // Automatic drift orbit cycle to simulate dynamic 3D rotational wobble
      const t = time * 0.0012; 
      const targetX = Math.sin(t) * 0.28;
      const targetY = Math.cos(t * 1.4) * 0.12;

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
      window.removeEventListener('resize', resizeCanvas);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      gl.deleteBuffer(buffer);
      gl.deleteTexture(imageTex);
      gl.deleteTexture(depthTex);
      gl.deleteProgram(program);
    };
  }, [image, depthImage]);

  return (
    <div 
      className="w-full h-full flex items-center justify-center pointer-events-none"
      style={{ aspectRatio: `${aspectRatio}` }}
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full object-contain pointer-events-none"
      />
    </div>
  );
};

export default DepthMapViewer;