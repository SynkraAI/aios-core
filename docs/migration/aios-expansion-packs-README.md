# AIOS Expansion Packs (Private)

**Repository:** `Pedrovaleriolopez/aios-expansion-packs`  
**Status:** PRIVATE  
**License:** PROPRIETARY  
**Purpose:** Proprietary expansion packs for AIOS Framework

---

## Overview

This repository contains proprietary expansion packs for the AIOS Framework. These packs are not open-source and are intended for internal use or licensed customers only.

## Available Packs

### Production Packs

1. **creator** (CreatorOS) - Content generation and creation workflows
   - Version: 1.0.0
   - Agents: 3 (blog-writer, content-orchestrator, course-architect)
   - Tasks: 4
   - Purpose: Generate educational courses, blog posts, social media content

2. **innerlens** - Personality analysis and psychometric profiling
   - Version: 1.0.0
   - Agents: 4 (fragment-extractor, innerlens-orchestrator, psychologist, quality-assurance)
   - Tasks: 5
   - Purpose: Big Five personality traits and 120+ psychological dimensions analysis

3. **mmos-mapper** - Cognitive architecture mapping and AI personality cloning
   - Version: 2.0.0
   - Agents: 7 (cognitive-analyst, debate, emulator, mind-mapper, mind-pm, research-specialist, system-prompt-architect)
   - Tasks: 12
   - Purpose: Advanced AI personality cloning with 94%+ voice fidelity

4. **aios-infrastructure-devops** - Infrastructure and DevOps automation
   - Version: 1.10.0
   - Agents: 1 (infra-devops-platform)
   - Tasks: 2
   - Purpose: Cloud infrastructure definition and management

5. **meeting-notes** - Meeting organization and note-taking
   - Version: 1.0.0
   - Agents: 1 (meeting-organizer)
   - Tasks: 1
   - Purpose: Organize, document, and track meeting notes

6. **hybrid-ops** - Hybrid operations expansion pack
   - Version: 2.0.0-pv
   - Agents: 18 (9 generic + 9 PV-powered)
   - Tasks: 9
   - Purpose: Transform business processes into hybrid execution systems
   - **Note:** Migrated from separate repository: https://github.com/Pedrovaleriolopez/aios-hybrid-ops-pedro-valerio

## Installation

### Method 1: Git Submodule (Recommended)

```bash
# Add as submodule
git submodule add https://github.com/Pedrovaleriolopez/aios-expansion-packs.git expansion-packs-private

# Initialize and update
git submodule update --init --recursive
```

### Method 2: Manual Copy

```bash
# Clone repository
git clone https://github.com/Pedrovaleriolopez/aios-expansion-packs.git /tmp/aios-expansion-packs

# Copy specific pack
cp -r /tmp/aios-expansion-packs/creator expansion-packs/

# Update core-config.yaml to register the pack
```

### Method 3: Future CLI Command

```bash
# When CLI command implemented
aios install expansion-pack creator --source private
```

## Usage

After installation, activate agents using their slash prefix:

```bash
# CreatorOS
@creator:blog-writer
@creator:content-orchestrator
@creator:course-architect

# InnerLens
@innerlens:psychologist
@innerlens:fragment-extractor

# MMOS-Mapper
@mmos:research-specialist
@mmos:mind-mapper
@mmos:emulator

# Infrastructure DevOps
@aiosInfraDevOps:infra-devops-platform

# Meeting Notes
@meetingNotes:meeting-organizer

# Hybrid-Ops
@hybridOps:process-mapper
@hybridOps:process-architect
```

## Structure

```
aios-expansion-packs/
├── creator/
├── innerlens/
├── mmos-mapper/
├── aios-infrastructure-devops/
├── meeting-notes/
├── hybrid-ops/
├── README.md (this file)
└── LICENSE (PROPRIETARY)
```

## License

**PROPRIETARY** - All rights reserved. These expansion packs are proprietary software and are not open-source.

See `LICENSE` file for full terms.

## Support

For support and licensing inquiries, contact: [Contact Information]

---

**Created:** 2025-11-12  
**Migration from:** `aios-fullstack/expansion-packs/` (Story 4.8)

