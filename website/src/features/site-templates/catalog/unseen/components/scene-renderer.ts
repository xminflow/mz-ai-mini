/** 原生 WebGL 场景材质：透视位移、连续水面法线与指针涟漪共用一次绘制。 */
const vertexSource = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() { vUv = aPosition * .5 + .5; gl_Position = vec4(aPosition, 0., 1.); }
`
const fragmentSource = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uImage;
uniform vec2 uSize;
uniform vec2 uImageSize;
uniform vec2 uPointer;
uniform float uTime;
uniform float uMotion;
uniform float uScroll;
uniform float uWaterline;
uniform vec4 uRipples[4];
void main() {
  vec2 uv = vec2(vUv.x, 1. - vUv.y);
  float depth = .3 + .7 * smoothstep(.18, 1., uv.y);
  vec2 camera = uPointer * vec2(.035, .022) * depth * uMotion;
  camera.x += uPointer.x * (uv.y - .5) * .016 * uMotion;
  camera.y += (uv.x - .5) * uPointer.y * .008 * uMotion;
  vec2 p = (uv - .5) / (1.09 + uScroll * .055 * uMotion) + .5 + camera;
  float water = smoothstep(uWaterline - .025, uWaterline + .08, uv.y);
  float perspective = max(0., (uv.y - uWaterline) / (1. - uWaterline));
  float wave = sin(uv.y * 115. - uTime * 1.35 + sin(uv.x * 19. + uTime * .7) * 2.);
  float crossWave = cos(uv.x * 37. + uv.y * 52. + uTime * .8);
  vec2 distortion = vec2(wave * .006 + crossWave * .0025, wave * .0018);
  float light = wave * crossWave * .014;
  for (int i = 0; i < 4; i++) {
    vec4 r = uRipples[i];
    float age = uTime - r.z;
    vec2 delta = uv - r.xy;
    delta.x *= uSize.x / uSize.y;
    float distance = length(delta);
    float envelope = exp(-pow((distance - age * .22) * 13., 2.)) * exp(-age * 1.6);
    float ripple = sin(distance * 95. - age * 19.) * envelope * r.w * step(0., age);
    distortion += normalize(delta + .0001) * ripple * .012;
    light += ripple * .035;
  }
  p += distortion * water * (.28 + perspective) * uMotion;
  float screenAspect = uSize.x / uSize.y;
  float imageAspect = uImageSize.x / uImageSize.y;
  vec2 cover = screenAspect > imageAspect ? vec2(1., imageAspect / screenAspect) : vec2(screenAspect / imageAspect, 1.);
  vec3 color = texture2D(uImage, (p - .5) * cover + .5).rgb;
  color += light * water * uMotion;
  gl_FragColor = vec4(color, 1.);
}
`

export interface SceneFrame {
  time: number
  motion: boolean
  pointer: readonly [number, number]
  scroll: number
  waterline: number
  ripples: Float32Array
}

export class SceneRenderer {
  private readonly gl: WebGLRenderingContext
  private readonly program: WebGLProgram
  private readonly texture: WebGLTexture
  private readonly buffer: WebGLBuffer
  private readonly uniforms: Record<string, WebGLUniformLocation | null>
  private imageSize: readonly [number, number] = [1, 1]

  constructor(private readonly canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, preserveDrawingBuffer: true })
    if (!gl) throw new Error('WebGL context unavailable')
    this.gl = gl
    const shaders: WebGLShader[] = []
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)
      if (!shader) throw new Error('Scene shader allocation failed')
      shaders.push(shader)
      gl.shaderSource(shader, source); gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || 'Scene shader compilation failed')
      return shader
    }
    const program = gl.createProgram()
    const texture = gl.createTexture()
    const buffer = gl.createBuffer()
    if (!program || !texture || !buffer) throw new Error('Scene resource allocation failed')
    try {
      gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource))
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource))
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'Scene linking failed')
    } catch (error) {
      gl.deleteProgram(program); gl.deleteTexture(texture); gl.deleteBuffer(buffer)
      throw error
    } finally { shaders.forEach(shader => gl.deleteShader(shader)) }
    this.program = program; this.texture = texture; this.buffer = buffer
    this.uniforms = Object.fromEntries(['uImage', 'uSize', 'uImageSize', 'uPointer', 'uTime', 'uMotion', 'uScroll', 'uWaterline', 'uRipples[0]'].map(name => [name, gl.getUniformLocation(program, name)]))
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'aPosition')
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.uniform1i(this.uniforms.uImage, 0)
  }

  setImage(image: HTMLImageElement) {
    this.imageSize = [image.naturalWidth, image.naturalHeight]
    const gl = this.gl
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)
  }

  resize(width: number, height: number) {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
    this.canvas.width = Math.round(width * ratio); this.canvas.height = Math.round(height * ratio)
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
  }

  draw(frame: SceneFrame) {
    const gl = this.gl, u = this.uniforms
    gl.useProgram(this.program)
    gl.uniform2f(u.uSize, this.canvas.width, this.canvas.height)
    gl.uniform2f(u.uImageSize, ...this.imageSize)
    gl.uniform2f(u.uPointer, ...frame.pointer)
    gl.uniform1f(u.uTime, frame.time)
    gl.uniform1f(u.uMotion, frame.motion ? 1 : 0)
    gl.uniform1f(u.uScroll, frame.scroll)
    gl.uniform1f(u.uWaterline, frame.waterline)
    gl.uniform4fv(u['uRipples[0]'], frame.ripples)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }

  dispose() {
    this.gl.deleteTexture(this.texture); this.gl.deleteBuffer(this.buffer); this.gl.deleteProgram(this.program)
  }
}
