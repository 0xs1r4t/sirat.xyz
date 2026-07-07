---
slug: implementing-vxpg-in-opengl
title: i implemented vxpg with opengl!
description: this is an overview of the process i went through over several weeks to implement VXPG (voxel path guiding) in OpenGL as a part of my final project for my real-time rendering class
tags: [opengl, computer graphics, c++, global illumination, path guiding, glsl]
type: projects
status: published
createdAt: April 19, 2026
updatedAt: June 30, 2026
---

## Table of Contents

## overview

**VXPG — Real-Time Path Guiding** was my final project for the real-time rendering module. The goal was to implement voxel path guiding (VXPG) from the SIGGRAPH 2024 paper *Real-Time Path Guiding Using Bounding Voxel Sampling* in pure OpenGL 4.3, without hardware ray tracing.

The demo renders global illumination in real time by learning a 3D irradiance distribution over a voxel grid each frame and then guiding secondary bounces toward high-contribution voxels. On top of the core algorithm I added a simple material system, an ImGui control panel, and optional ReSTIR GI + denoising passes.

Everything runs in real time at 1920×1080 on my GPU, with controls to pause the pipeline, tweak resolution, and toggle debug overlays (voxel AABBs, CDF stats, ReSTIR reservoirs).## demos

**final result (VXPG + optional ReSTIR GI):**

https://youtu.be/nRqxeeLQlH8

**early prototype (basic voxelization + indirect buffer, no ReSTIR):**

[TODO: link a shorter WIP capture if you have one]

### pipeline

Each frame runs a sequence of passes:

1. **Shadow map** (vertex/fragment): render a depth map from the light, with simple PCF filtering for soft shadows.
2. **Voxelization** (vertex/geometry/fragment): clip triangles against a uniform voxel grid and write tight AABBs into an SSBO using fixed-point atomic min/max.
3. **G-buffer** (vertex/fragment): store position, normal, albedo, and material parameters for all visible pixels.
4. **Light injection** (compute): trace BSDF rays from camera-visible points and inject irradiance into voxels, so only voxels that actually contribute to the image get non-zero values.
5. **CDF build** (compute): build a power-based cumulative distribution over voxels based on irradiance and approximate surface area.
6. **Path guiding** (compute): for each pixel, sample one VXPG candidate and one BSDF candidate, combine them with multiple importance sampling, and temporally blend with the previous indirect buffer.
7. **Optional ReSTIR GI** (compute): run temporal and spatial reservoir resampling on the indirect buffer.
8. **Denoise + lighting** (compute/fragment): apply a lightweight Gaussian blur to the indirect buffer and combine direct + indirect + skybox in the lighting pass.

### voxels and light injection

The scene is partitioned into an \(N^3\) voxel grid (8³–128³ in my implementation, usually 64³ for the demo). Each voxel stores a tight axis-aligned bounding box of the geometry intersecting it, plus fixed-point-encoded irradiance accumulated from BSDF rays.

Instead of tracing from lights and risking energy being injected into occluded regions, I trace rays from camera-visible shading points. Any hit point is guaranteed to matter for at least one pixel, which keeps the voxel irradiance distribution focused on actually visible geometry.

### path guiding and MIS

Once the voxel grid is populated, a compute shader builds a CDF over voxels based on luminance and approximate surface area, then samples it per pixel via binary search to pick a high-contribution voxel.

Within the chosen voxel, I sample a point on the AABB surface using a solid-angle-weighted face selection, then march a DDA ray through the grid to find the actual hit point and reject samples that fall outside the stored bounds. VXPG samples are then combined with cosine-weighted BSDF samples using the balance heuristic, so BSDF still covers regions the voxel grid didn’t capture well.

### restir + denoising

On top of VXPG, I implemented a minimal ReSTIR GI pass that treats the VXPG indirect buffer as the candidate set and performs weighted reservoir resampling over time and space, with an \(M\)-cap of 20 to avoid over-temporal bias.

A simple isotropic Gaussian denoiser runs afterward on the indirect buffer, with runtime-adjustable kernel radius and sigma. Lower sigma smooths noise while preserving detail; higher sigma turns the image into a softer, more painterly look.

## results

Qualitatively, VXPG significantly improves indirect illumination compared to BSDF-only sampling, especially when most energy comes through a small solid angle (like a single light tucked off to one side of Suzanne).

At 64³ voxel resolution, the demo converges to smooth indirect lighting with low temporal alpha (0.05–0.1) and minimal ghosting under static conditions, while still adapting quickly when the light or camera moves.

## limitations and future work

My implementation simplifies several parts of the reference algorithm: voxel selection uses a power-based CDF instead of the paper’s visibility-aware superpixel/supervoxel clustering, and solid-angle face weights use an approximate \(A \cos\theta / d^2\) term instead of the full spherical-rectangle sampler.

The biggest missing piece is proper visibility-aware clustering and more robust ray traversal; DDA ray marching through a uniform grid is cheaper than RTX BVH traversal but more fragile on thin geometry, and I currently cap the voxel resolution at 128³ due to memory and performance constraints.

## links

- [GitHub repository](https://github.com/0xs1r4t/vxpg-implementation)
- [VXPG paper — Real-Time Path Guiding Using Bounding Voxel Sampling](https://suikasibyl.github.io/files/vxpg/paper.pdf)
- [Reference implementation](https://github.com/SuikaSibyl/vxpg)
- [Demo video](https://youtu.be/nRqxeeLQlH8)

## references and inspirations

- Lu et al., *Real-Time Path Guiding Using Bounding Voxel Sampling*, SIGGRAPH 2024.
- Ouyang et al., *ReSTIR GI: Path Resampling for Real-Time Path Tracing*, HPG 2021.
- Bitterli et al., *Spatiotemporal Reservoir Resampling*, SIGGRAPH 2020.
- Schied et al., *Gradient Estimation for Real-Time Adaptive Temporal Filtering*, HPG 2018.
- Ureña et al., *An Area-Preserving Parametrization for Spherical Rectangles*, EGSR 2013.