/**
 * Particle morph shader — ported from the New Era template (script.js). A dense
 * `SphereGeometry` rendered as points morphs through the scroll phases we keep:
 * sphere → funnel → DNA → wave, driven by the `uScroll` (legacy units) and
 * `uTime` uniforms. The tunnel, black-hole and galaxy phases were removed;
 * `uFade` fades the whole cloud out at the end of the section.
 */

export const particleVertexShader = /* glsl */ `
    uniform float uTime;
    uniform float uScroll;
    uniform float uIntro; // 0 = on-load filled/appearing, 1 = settled
    uniform float uFade;  // 1 = visible, 0 = released (end of section)
    varying float vEdgeFade;
    varying vec3 vColor;

    // 3D Simplex Noise
    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
    float snoise(vec3 v){
      const vec2 C = vec2(1.0/6.0, 1.0/3.0); const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i = floor(v + dot(v, C.yyy)); vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz); vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy); vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + 1.0 * C.xxx; vec3 x2 = x0 - i2 + 2.0 * C.xxx; vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
      i = mod(i, 289.0);
      vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 1.0/7.0; vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
      vec4 x_ = floor(j * ns.z); vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ *ns.x + ns.yyyy; vec4 y = y_ *ns.x + ns.yyyy; vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy); vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0)*2.0 + 1.0; vec4 s1 = floor(b1)*2.0 + 1.0; vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy; vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 p0 = vec3(a0.xy,h.x); vec3 p1 = vec3(a0.zw,h.y); vec3 p2 = vec3(a1.xy,h.z); vec3 p3 = vec3(a1.zw,h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0); m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    float random(vec3 p) {
        return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
    }

    void main() {
        vec3 normalVec = normalize(position);

        // --- SPHERE POS ---
        // Increased uTime multipliers to make deformation faster
        float noiseVal = snoise(position * 0.5 + uTime * 0.8);
        noiseVal += 0.5 * snoise(position * 1.5 - uTime * 1.2);
        vec3 spherePos = position + normalVec * (noiseVal * 0.5);

        // --- STRETCHED Y FOR FUNNEL & DNA ---
        // Original position.y is roughly +4.2 to -4.2.
        // We stretch it heavily downwards so the camera can pan along it.
        float stretchedY = position.y * 7.0 - 8.0; // Ranges from +16.5 down to -32.5

        // --- FUNNEL POS ---
        // Wide at the top, narrow at the bottom
        float funnelRadius = 1.0 + smoothstep(-32.0, 16.0, stretchedY) * 5.0;
        float angle = atan(position.z, position.x) + stretchedY * 0.3; // Twist the funnel
        vec3 funnelPos = vec3(funnelRadius * cos(angle), stretchedY, funnelRadius * sin(angle));
        // Add organic noise to the funnel walls
        // Increased uTime multiplier to make funnel deformation faster
        funnelPos += normalVec * (snoise(funnelPos * 0.3 + uTime * 3.0) * 1.0);

        // --- DNA POS (Volumetric Thick Tubes) ---
        float rnd1 = random(position);
        float rnd2 = random(position + vec3(1.0));
        float rnd3 = random(position + vec3(2.0));

        float t = stretchedY; // Height along helix
        float twistMultiplier = 0.65;
        float twist = t * twistMultiplier;
        float dnaRadius = 1.0; // Scaled down radius
        float strandThickness = 0.35; // Scaled down strands

        vec3 dnaPos;
        if (rnd1 < 0.40) { // Strand 1 (40% of particles)
            vec3 core = vec3(dnaRadius * cos(twist), t, dnaRadius * sin(twist));
            vec3 offset = vec3(rnd1 - 0.2, rnd2 - 0.5, rnd3 - 0.5) * 2.0 * strandThickness;
            dnaPos = core + offset;
        } else if (rnd1 < 0.80) { // Strand 2 (40% of particles)
            vec3 core = vec3(dnaRadius * cos(twist + 3.14159), t, dnaRadius * sin(twist + 3.14159));
            vec3 offset = vec3(rnd1 - 0.6, rnd2 - 0.5, rnd3 - 0.5) * 2.0 * strandThickness;
            dnaPos = core + offset;
        } else { // Rungs (20% of particles)
            float rungT = (rnd1 - 0.80) * 5.0;
            // Dense, distinct rungs
            float discreteT = floor(t * 2.5) / 2.5;
            float discreteTwist = discreteT * twistMultiplier;
            vec3 p1 = vec3(dnaRadius * cos(discreteTwist), discreteT, dnaRadius * sin(discreteTwist));
            vec3 p2 = vec3(dnaRadius * cos(discreteTwist + 3.14159), discreteT, dnaRadius * sin(discreteTwist + 3.14159));

            vec3 core = mix(p1, p2, rungT);
            vec3 offset = vec3(rnd1 - 0.9, rnd2 - 0.5, rnd3 - 0.5) * 2.0 * 0.10; // thinner rungs
            dnaPos = core + offset;
        }

        // Optional: slight organic waving to the whole structure
        dnaPos.x += snoise(vec3(0.0, t * 0.2, uTime * 0.2)) * 0.5;
        dnaPos.z += snoise(vec3(t * 0.2, 0.0, uTime * 0.2)) * 0.5;

        // --- 4-PHASE TIMELINE ---
        // Phase 1 (0.0 to 0.15): Sphere morphs into Funnel
        // Phase 2 (0.15 to 0.30): Funnel morphs into DNA
        float phase1 = smoothstep(0.0, 0.15, uScroll);
        float phase2 = smoothstep(0.15, 0.30, uScroll);

        vec3 step1Pos = mix(spherePos, funnelPos, phase1);
        vec3 step2Pos = mix(step1Pos, dnaPos, phase2);

        // Phase 3 (0.30 to 0.50): DNA melts into the Wave
        // Phase 4 (0.50 to 1.00): 50% of the massive 1200vh scroll is purely flying!
        float meltProgress = smoothstep(0.30, 0.50, uScroll);

        // meltY must go high enough (max stretchedY is 37.0, plus 45.0 transition = 82.0)
        // so that EVERY single particle finishes melting!
        float meltY = mix(-50.0, 90.0, meltProgress);

        // Mathematically safe melt calculation (avoids undefined WebGL behavior)
        // depth is 0 at the top of the melt line, and 45.0 at the bottom of the transition zone.
        float depthBelowMeltLine = meltY - stretchedY;
        float localMelt = smoothstep(0.0, 45.0, depthBelowMeltLine);

        // Wave Pos
        // Z stretch to create a deeply infinite ocean while preserving density
        // Reverted back to -45.0 to keep DNA animation alignment perfectly intact
        vec3 targetWavePos = vec3(position.x * 7.0, -45.0, position.z * 25.0);

        // Offset X to separate orange and blue particles into a gradient
        targetWavePos.x += position.y * 6.0;

        // Restore beautiful rolling Simplex noise hills (as seen in user's screenshot)
        float waveNoise = snoise(vec3(targetWavePos.x * 0.08, targetWavePos.z * 0.08, uTime * 0.15)) * 2.0;
        waveNoise += snoise(vec3(targetWavePos.x * 0.16, targetWavePos.z * 0.16, uTime * 0.3)) * 0.8;
        targetWavePos.y += waveNoise;

        vec3 finalPos = mix(step2Pos, targetWavePos, localMelt);

        vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);

        // Fresnel / Edge fade
        vec3 viewDir = normalize(-mvPosition.xyz);
        vec3 worldNormal = normalize(normalMatrix * normalVec); // approximate normal

        float rim = 1.0 - abs(dot(viewDir, worldNormal));

        // Make the center dark and edges glowing for sphere, but fully visible for DNA
        float edgeFadeSphere = smoothstep(0.4, 0.9, rim);
        float edgeFadeDNA = 1.0;

        // Morph value from 0 to 1 representing the total transition to DNA/Wave
        float morph = smoothstep(0.0, 0.30, uScroll);

        // --- DYNAMIC OPACITY & SIZE ---
        // Because the particle density changes drastically (dense sphere -> dense DNA -> massive wave),
        // we must dynamically adjust the brightness and size so it never blows out and never gets too dim.

        float opacityMultiplier = 0.8;
        float sizeMultiplier = 1.5;

        // DNA Phase: Extremely dense, reduce opacity to prevent white-out
        float dnaPhase = smoothstep(0.15, 0.30, uScroll);
        opacityMultiplier = mix(opacityMultiplier, 0.25, dnaPhase);
        sizeMultiplier = mix(sizeMultiplier, 4.0, dnaPhase);

        // Wave Phase: Flat plane has massive overlap at grazing angles. Keep opacity low to preserve rich colors!
        float wavePhase = smoothstep(0.30, 0.50, uScroll);
        opacityMultiplier = mix(opacityMultiplier, 0.35, wavePhase);
        sizeMultiplier = mix(sizeMultiplier, 4.0, wavePhase);

        // Intro: at uIntro=0 the sphere is fully filled (whole disc visible);
        // as uIntro→1 the centre hollows back to the fresnel rim. A short fade
        // (smoothstep) brings the whole cloud up from nothing on load.
        float introSphere = mix(1.0, edgeFadeSphere, uIntro);
        vEdgeFade = mix(introSphere, edgeFadeDNA, morph) * opacityMultiplier;
        vEdgeFade *= smoothstep(0.0, 0.2, uIntro);
        vEdgeFade *= uFade;

        // --- COLORS ---
        vec3 cBottom = vec3(0.55, 0.04, 0.03); // deep brand red
        vec3 cTop = vec3(1.0, 0.80, 0.68);     // warm white
        float baseColorMix = smoothstep(-3.0, 3.0, position.y + position.x * 0.5);
        vColor = mix(cBottom, cTop, clamp(baseColorMix, 0.0, 1.0));

        // Use the dynamically calculated sizeMultiplier
        gl_PointSize = sizeMultiplier * (10.0 / -mvPosition.z);

        // Ensure a minimum size so that distant particles on the wave don't disappear into subpixel darkness!
        gl_PointSize = max(gl_PointSize, 1.5);

        gl_Position = projectionMatrix * mvPosition;
    }
`;

export const particleFragmentShader = /* glsl */ `
    varying float vEdgeFade;
    varying vec3 vColor;

    void main() {
        vec2 xy = gl_PointCoord.xy - vec2(0.5);
        float ll = length(xy);
        if(ll > 0.5) discard;

        // Soft white points
        float pointAlpha = smoothstep(0.5, 0.1, ll);

        // Color is driven by vertex vColor, opacity driven by edge fade
        gl_FragColor = vec4(vColor, vEdgeFade * pointAlpha * 0.9);
    }
`;
