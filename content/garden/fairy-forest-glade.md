---
slug: fairy-forest-glade
title: fairy forest glade
description: my computer graphics final project
background: /images/garden/fairy-forest-glade/screengrabs/fairyFireflies.webm
tags: [opengl, computer graphics, c++, procedural generation, cel shading, glsl]
type: projects
status: published
createdAt: January 18, 2026
updatedAt: May 22, 2026
---

## Table of Contents

## overview

**fairy forest glade** was my individual project for [CS7GV6 Computer Graphics](https://www.tcd.ie/). the basic requirement was to animate fireflies and a hovering fairy with soft night lighting. this was a good base to work with and add to, and i had always wanted to tackle a procedurally generated terrain. this project looked like the perfect opportunity to implement this!

the final result was an OpenGL scene created from scratch in C++, with a procedurally generated terrain, instanced foliage (300k+ grass blades), billboarded trees, a cel-shaded fairy with hierarchical wing animation, fireflies that orbit her and act as point light sources, and a procedural night sky with an animated moon. everything runs at 60 FPS through a combination of GPU instancing, view frustum culling, and a distance-based LOD system.

## demos

**final result:**

https://youtu.be/aMr9yzhNL9E

**halfway point (control + hierarchical animation):**

https://youtu.be/YoRlQn46adU

## what i built

### terrain

the terrain is a 50×50 mesh generated on the CPU using **Fractional Brownian Motion** (FBM). Multiple octaves of Perlin noise are summed together, where each octave doubles the frequency and halves the amplitude. the formula:

$$
h(x, z) = \sum_{i=0}^{N} \text{amplitude}_i \cdot \text{perlin}(\text{position} \cdot \text{frequency}_i)
$$

normals are computed from neighboring vertex heights for smooth per-fragment lighting. height-based colour blending gives the terrain dark valleys, green mid-slopes, and lighter peaks. inspired by [Inigo Quilez's FBM tutorial](https://www.youtube.com/watch?v=BFld4EBO2RE) and [Acerola's terrain generation video](https://www.youtube.com/watch?v=J1OdPrO7GD0). the equation for the finite difference normal is as follows:

$$
\vec{n} = \text{normalize}\begin{pmatrix} h(x-\delta, z) - h(x+\delta, z) \\ 2\delta \\ h(x, z-\delta) - h(x, z+\delta) \end{pmatrix}
$$

### foliage: grass, flowers, trees

all vegetation uses **GPU instancing**, with one draw call per foliage type, and instance data (position, texture index) packed into a buffer. this is what lets ~300,000 grass instances render at 60 FPS.

grass uses a **cross-quad** geometry (two quads rotated 90° from each other) for a 3D appearance from any angle, with alpha-masked textures and wind animation driven by layered noise in the vertex shader. flowers are procedurally generated: petal patterns using polar coordinates (`sin(angle * 5.0)` for a 5-petal design), with pink-purple colour ranges and a separately rendered stem.

<video autoplay loop muted playsinline>
  <source src="/images/garden/fairy-forest-glade/screengrabs/terrainFoliage.webm" type="video/webm" />
  <source src="/images/garden/fairy-forest-glade/screengrabs/terrainFoliage.mp4" type="video/mp4" />
</video>

trees have two variants, normal and thick, with OBJ branch models loaded via Assimp and **billboarded leaf clusters** generated around branch vertices. leaves are quad instances in spherical distributions around attachment points, each with a random texture from a set of 4 alpha-masked variants.

```cpp
// leaf cluster generation, spherical distribution
float theta = dist01(rng) * 2.0f * glm::pi<float>();
float phi   = acos(2.0f * dist01(rng) - 1.0f);
float r     = cluster.radius * pow(dist01(rng), 1.0f / 3.0f); // uniform sphere
leaf.offset = r * glm::vec3(sin(phi)*cos(theta), sin(phi)*sin(theta), cos(phi));
```

### LOD and frustum culling

a three-zone **LOD system** scales foliage density by distance:

| zone   | distance    | density |
| ------ | ----------- | ------- |
| near   | < 15 units  | 100%    |
| mid    | 15–35 units | 50%     |
| far    | 35–60 units | 20%     |
| beyond | > 60 units  | culled  |

grass gets a special ultra-dense carpet within 8 units of the camera before the LOD kicks in. **sphere-based view frustum culling** (6-plane test on a bounding sphere per foliage instance) filters visible instances on the CPU before uploading to the GPU each frame. the Frustum struct lives in `camera.h` and gets recomputed per frame from the camera's Euler angles.

As per the sphere frustum culling test, a point is culled if for any plane $i$:

$$
\vec{n}_i \cdot \vec{c} + d_i < -r
$$

where $\vec{n}_i$ is the plane normal, $\vec{c}$ is the sphere centre, $d_i$ is the plane offset, and $r$ is the bounding radius.

### fairy character and animation

the fairy model was built in Blender, with a body, two upper wings, two lower wings as separate OBJs. it was then loaded with Assimp. the wing hierarchy uses **forward kinematics**: body is the root, upper wings are children of the body, lower wings are children of their respective upper wings.

```cpp
// hierarchy setup
leftUpperWing.parent  = &body;
leftLowerWing.parent  = &leftUpperWing;
rightUpperWing.parent = &body;
rightLowerWing.parent = &rightUpperWing;
```

wing flapping is driven by sine waves with phase offsets. upper and lower wings flap slightly out of sync to look more organic. a separate hover animation bobs the body up and down using `sin(currentTime * hoverSpeed) * hoverAmount`. the fairy is fully controllable: arrow keys for 6DOF movement, `I`/`K` for vertical flight, `J`/`L` for rotation.

<video autoplay loop muted playsinline>
  <source src="/images/garden/fairy-forest-glade/screengrabs/fairyFireflies.webm" type="video/webm" />
  <source src="/images/garden/fairy-forest-glade/screengrabs/fairyFireflies.mp4" type="video/mp4" />
</video>

the hover bob:

$$
y(t) = y_0 + A \cdot \sin(\omega_{\text{hover}} \cdot t)
$$

the wing flap with phase offset between upper and lower wings:

$$
\theta_{\text{upper}}(t) = \theta_{\max} \cdot \sin(\omega_{\text{flap}} \cdot t)
$$

$$
\theta_{\text{lower}}(t) = \frac{\theta_{\max}}{2} \cdot \sin(\omega_{\text{flap}} \cdot t + \phi)
$$

where $\phi$ is the phase delay between upper and lower wings.

### lighting

three light sources interact in the scene:

- **moonlight**: a directional light with cool blue-white colour (`vec3(0.6, 0.7, 0.9)`), low intensity, simulating low-angle night atmosphere. the moon direction slowly animates over time.
- **fairy light**: a warm point light (`vec3(1.0, 0.9, 0.6)`) centered on the fairy's position with a 1.5-unit offset upward.
- **firefly lights**: up to 8 of the 50 closest fireflies contribute as point lights, each with individual colours and positions updated per-frame.

all lighting uses the **Blinn-Phong** model in fragment shaders (ambient + diffuse + specular per source, with quadratic attenuation for point lights). lighting is computed in world space.

### cel shading

all surfaces, i.e., the terrain, fairy, trees, grass, flowers, go through a cel-shading pass that quantises the continuous Blinn-Phong diffuse value into discrete bands:

```glsl
// cel shading quantisation
float diffuse = max(dot(normal, lightDir), 0.0);
int numBands = 4;
float celDiffuse = floor(diffuse * numBands) / numBands;

// sharp specular highlight
float spec = pow(max(dot(normal, halfVector), 0.0), shininess);
if (spec > 0.5) finalColor = vec3(1.0); // full white highlight
```

fireflies are excluded from this. their glow stays smooth for the magical effect.

a shared `colours.glsl` library defines the fairy-themed pastel palette (pinks, lavenders, mints, peaches) and utility functions (`adjustBrightness`, `blendColors`) included across all shaders.

the quantisation step more formally uses the following equation:

$$
L_{\text{cel}} = \frac{\lfloor L \cdot N \rfloor}{N}, \quad L = \max(\vec{n} \cdot \vec{l},\ 0)
$$

where $N$ is the number of shading bands.

### skybox and procedural sky

the skybox uses a 4K night HDRI (`satara_night_no_lamps_4k.exr`) from PolyHaven, loaded with OpenEXR. on top of it, a **procedural sky shader** renders animated twinkling stars and a smooth moon that tracks the `moonDir` uniform, which is the same direction vector used for the main directional light, so the moon matches the actual light source.

### fireflies

50 fireflies orbit the fairy's position within a 2.5-unit radius. each has an individual position, velocity, colour, pulse phase, and size. they use **billboard rendering** (always face the camera via view matrix right/up vectors) with a radial alpha gradient and **additive blending** (`GL_SRC_ALPHA, GL_ONE`) for the glow effect. pulse animation: `sin(time * 2.0 + phase) * 0.5 + 0.5`.

for the fireflies, the pulse animation:

$$
\alpha(t) = 0.5 + 0.5 \cdot \sin(2t + \phi_i)
$$

point light attenuation:

$$
F_{\text{att}} = \frac{1}{K_c + K_l \cdot d + K_q \cdot d^2}
$$

where $K_c$, $K_l$, $K_q$ are the constant, linear, and quadratic terms.

## tech stack

| tool                | detail             |
| ------------------- | ------------------ |
| **language**        | C++17              |
| **graphics API**    | OpenGL 3.3 Core    |
| **build**           | CMake 3.16 + vcpkg |
| **windowing**       | GLFW 3.4           |
| **GL extensions**   | GLEW 2.1           |
| **math**            | GLM                |
| **model loading**   | Assimp             |
| **texture loading** | stb_image          |
| **HDRI**            | OpenEXR + IMath    |

## premise and world building

the aesthetic references i leaned on were _Frieren: Beyond Journey's End_ for the fairy's character and lonely-but-not-sad vibe, _Winx Club_ for the general fairy world-building and cute critter companions, the NewJeans ASAP music video for the forest lighting and dreamy soft colour palette, and _Love and Deepspace_ for the glowy shader inspiration.

<figure style="text-align: center;">
  <center><img src="/images/garden/fairy-forest-glade/anime/frieren_lying_in_a_pond.webp" alt="frieren lying in a pond" /></center>
  <figcaption>frieren lying in a pond</figcaption>
</figure>

| ![Lighting and aesthetic inspiration](/images/garden/fairy-forest-glade/newjeans/1.webp) | ![Home inspiration](/images/garden/fairy-forest-glade/newjeans/2.webp) | ![PBR + NPR in harmony](/images/garden/fairy-forest-glade/newjeans/3.webp) | ![Water simulation and interaction inspiration](/images/garden/fairy-forest-glade/newjeans/4.webp) |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Lighting and aesthetic inspiration                                                       | Home inspiration                                                       | PBR + NPR in harmony                                                       | Water simulation and interaction inspiration                                                       |

| ![Rafayel's pre-attack battle animation](/images/garden/fairy-forest-glade/love_and_deepspace/1.webp) | ![Rafayel's attack scene battle animation](/images/garden/fairy-forest-glade/love_and_deepspace/2.webp) |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Rafayel's pre-attack battle animation                                                                 | Rafayel's attack scene battle animation                                                                 |

| ![MC's solo battle animation](/images/garden/fairy-forest-glade/love_and_deepspace/3.webp) | ![Xavier's combination pre-attack battle animation](/images/garden/fairy-forest-glade/love_and_deepspace/4.webp) | ![Xavier's combination attack scene battle animation](/images/garden/fairy-forest-glade/love_and_deepspace/5.webp) |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| MC's solo battle animation                                                                 | Xavier's combination pre-attack battle animation                                                                 | Xavier's combination attack scene battle animation                                                                 |

i gave the world a narrative that i could not really end up sticking to. while it acted as a good starting point, a lot of its aspects were things i didn't get enough time to implement, and later, it made no sense to add them to the scene. here's some concept sketches i did for the scene, the main character and the general visual aesthetics i was going for:

![concept sketch for fairy forest glade](/images/garden/fairy-forest-glade/concept/general_scene.webp)

![character sheet for main character](/images/garden/fairy-forest-glade/concept/CharacterSheet.webp)

## what got left out

a lot did. the biggest gap was the fairy's home. i planned to have an abandoned metro car with an apothecary and a massive glowing desktop setup. i had Blender assets from years ago that i'd abandoned that were almost perfect for this, but December had other plans. the summoning circle, the second playable character with a switchable POV, and the other bioluminescent creatures all stayed on the cutting room floor too.

i also had a full character sheet and outfit design for the fairy that didn't make it into the demo video (my TA told me to add them in during the demo, so they're in the final report but not the video). the cel shading system also has a lot of room to grow. i'd like to explore more painterly approaches, potentially procedural normal maps or outline passes.

![fairy model in blender](/images/garden/fairy-forest-glade/concept/fairy_model_blender.webp)

i plan to keep working on this in the future.

## links

- [GitHub repository](https://github.com/0xs1r4t/fairy-forest-glade)

## references and inspirations

- [Inigo Quilez - Painting a Landscape with Mathematics](https://www.youtube.com/watch?v=BFld4EBO2RE) FBM terrain technique
- [Acerola - How Do Games Render So Much Grass?](https://www.youtube.com/watch?v=Y0Ko0kvwfgA) billboard grass + GPU instancing
- [Acerola - What I Did To Optimize My Game's Grass](https://www.youtube.com/watch?v=PNvlqsXdQic) LOD and instancing optimisations
- [KodiakWhale - How I made better foliage than 99% of games](https://www.youtube.com/watch?v=GOfttJQ-FGw) stylised foliage approach
- [Trung Duy Nguyen - Anime Tree Tutorial in Blender](https://www.youtube.com/watch?v=52sTppv7Y-E) camera-facing billboards + cel shading aesthetic
- [LearnOpenGL - Camera](https://learnopengl.com/Getting-started/Camera) camera system base
- [Poly Haven - Satara Night No Lamps HDRI](https://polyhaven.com/a/satara_night_no_lamps) skybox texture
