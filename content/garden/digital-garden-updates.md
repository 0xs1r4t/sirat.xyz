---
slug: digital-garden-updates
title: an update
description: so much for holding myself accountable lol. anyway here's what i've been up to in the past year (mostly positive!!!)
tags:
  [
    graphics,
    generative ai (hate),
    art,
    computer vision,
    projects,
    updates,
    life reset,
  ]
type: life updates
status: published
createdAt: January 16, 2026
updatedAt: January 16, 2026
---

## Table of Contents

# general

i'm back! i have been here the whole time, but i did voluntarily leave my previous job and move my whole life to a place ~8,300km from my previous home so that i could go back to school (i'm studying to get a master's degree). in my first post, [[about-this-digital-garden]], i had said i'll keep it there to "keep myself accountable", but considering how my next update is being made a whole year later, that clearly wasn't good enough to keep me on top of things.

i will mostly type in lowercase and swear a little here and there because generative ai has already stolen enough from me so i might as well piss off some boomer who accidentally landed here after i posted my portfolio on linkedin. or maybe this is just generative ai emulating my internet personality that was curated over the course of at least a decade and a quarter. i guess we'd never know.

while generative ai eats itself up and produces even more slop than before, i wanted to say that i have been working on some stuff in the last year, mostly class assignments that have used more brain cells of mine than how many i knew i possessed.

# (relevant) stuff i've been working on

## fun with OpenGL

first up is this [fairy forest glade](https://github.com/0xs1r4t/fairy-forest-glade), a project i undertook as a part of my computer graphics class. i had to learn how to code with C++ again because my previous job made my brain cells evaporate with busy work. anyway, now i can kinda use slightly complicated mathematics and OpenGL to make cool graphics, so that's cool.

as a part of this project, i made a procedural terrain that had variable (x, y, (min z, max z)) coordinates, successfully generated a variety of foliage, that too based on LOD (level-of-distance) so that there would be less foliage further away from the camera. i also made sure the foliage was billboarded, i.e. it's normals always face the camera. this allowed to mostly use optimised images instead of heavy, high-poly 3d models of foliage. i will create a separate post for this along with a summarised README for interviewers and randoms.

## gaussian splattering my brains

second and last on this list is [this project for my computer vision class that has no name](https://github.com/0xs1r4t/npr-ar-cv). i kinda wanted to make it to make some progress for my dissertation that will be due by august this year, and also explore non-generative ai solutions within the ai space for creative/artistic output. pre-2022, this space was pretty fun! i remember GANs (Generative Adversarial Networks) pretty positively, though they were definitely part of the art theft epidemic that continues to this day, perpetrated by big tech companies that willingly fired their ethics teams to win the "agi race" which is just a circle jerk of investors probably giggling like teens and rubbing their hands like comic book villains because their technofeudalism was soooo successful and "omg we actually rule the world now lol let's take all the jobs away uwu".

before i get too sidetracked and make this a subscription based newsletter despite having probably like 0 zero readers (?), i basically used [DepthAnything](https://arxiv.org/abs/2401.10891) and [Gaussian Splatting](https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/), along with an attempt at [Depth Fusion](https://arxiv.org/abs/2505.07398), to kind of replicate the effects of this paper, [RTG-SLAM](https://arxiv.org/abs/2404.19706), which was to have real-time Gaussian Splatting, but with a monocular lense (like something with your phone). I wanted to use these results to then apply shaders to and make cool art. shaders use deterministic mathematics most of the time, rather than probabilistic methods employed by artificial intelligence, making it the perfect anti-genai project while still staying in the domain of ai, or more specifically, computer vision.

the results aren't that great but i was able to give a live demo of video → gaussian splat (ply file) → shader applied on gaussian splat so it wasn't a total failure either. i DO still need to investigate the literature more deeply to get a result that would work out for my dissertation and give me a good gap analysis for later, but i have time! i doubt i'd be able to get anything novel done by the time i'm done with this but a girl can dream.

i also did use OpenCV and OpenGL on C++ since i was able to learn it pretty decently with what all i did for my graphics project, and this is my first time using C++ for ai-related code. it's a bit involved so unless i get drastic optimisation, i might not use this combo again. or maybe i will because [WASM + WebNN + WebGPU](https://www.youtu.be/5CvOjKIpnYk&t) is something i'm looking to explore. if i figure out C for ai (or C in general) i might consider it even more because as long as there's no memory leaks, i can probably get max memory and performance gains.

## game engines hate github

i also worked on a few group projects using Unity and Unreal, which has been fun, but i feel like those projects are not MY babies so idk if i should talk about their technical aspects. i DID break my head quite a bit esp due to all the version control issues. these game engines kinda hate github lol.

# (relevant) stuff i will work on

1. i will improve my previous projects. i have some projects from half a decade that are still kinda cool and they definitely deserve to see the light (perhaps with a few updates).
2. i will continue to work on the two projects i mentioned here to clean them up and have them looking profesh.
3. i will work on improving this portfolio. i previously had my posts hosted on notion, but i think it's more convenient to have them on github as markdown files. i get to customise them more and more easily than before!
4. networking and job hunting + begging :) coffee chats? hackathons? game jams? i _missed_ being a university student.
5. art. more of it. any of it. all of it. as long as its made with my bare hands <3
