# Design High-CTR YouTube Thumbnails

> Task ID: paddy-thumbnail-design
> Agent: Paddy Galloway (YouTube Thumbnail Strategist)
> Version: 1.0.0

## Description

Design data-driven YouTube thumbnails optimized for maximum CTR using Paddy Galloway's proven frameworks. This task generates 10-20 concept variations using the Glance Test Framework, Emotion Hierarchy, and visual psychology principles.

**Core Principle:** "You have 0.5 seconds. Half a second. That's your entire window."

## Prerequisites

- Video title or concept defined
- Understanding of target audience/niche
- Access to photo assets (face shots, objects, backgrounds)
- Basic image editing capability

## Workflow

### Interactive Elicitation

1. **Gather Video Information**
   - What is the video title?
   - What is the main promise/hook of the video?
   - What niche/category is this video? (tutorial, review, story, opinion, educational)

2. **Identify Emotional Target**
   - Apply Emotion Hierarchy Framework
   - Recommend primary emotion based on content type
   - Confirm emotion aligns with video promise

3. **Confirm Production Assets**
   - Face shots available? (expressions needed)
   - Objects/props available?
   - Background preferences

### Steps

1. **Apply Glance Test Framework**
   - Define Layer 1 (0-100ms): Instant recognition - what IS this?
   - Define Layer 2 (100-300ms): Emotional response - what do I FEEL?
   - Define Layer 3 (300-500ms): Curiosity gap - why must I CLICK?
   - Validation: All three layers have clear answers

2. **Select Primary Emotion (Emotion Hierarchy)**

   | Content Type | Recommended Emotion | CTR Impact |
   |--------------|---------------------|------------|
   | Tutorial | Aspiracao + Curiosidade | +50-150% |
   | Review | Controversia + Curiosidade | +100-200% |
   | Story/Vlog | Curiosidade | +150-300% |
   | Opinion | Controversia | +100-200% |
   | Educational | Curiosidade + leve Medo | +100-200% |

   - Validation: Emotion selected matches content type

3. **Generate Concept Batch (ABC Testing)**
   - Generate minimum 10 concepts, ideal 20
   - Each concept MUST be drastically different
   - Vary: angle, emotion, text presence, face presence, colors, composition

   **Concept Categories to Cover:**
   - CURIOSIDADE: 5-7 concepts (default winner)
   - ASPIRACAO: 3-4 concepts (transformation focus)
   - CONTROVERSIA: 2-3 concepts (opinion/tension)
   - MINIMALISTA: 2-3 concepts (text/graphic only)

   - Validation: Minimum 10 concepts generated

4. **Apply Face & Eyes Framework (if using faces)**

   **Expression Selection:**
   - Tier 1 (highest): Choque/Surpresa, Raiva, Medo genuino (+100-200%)
   - Tier 2 (high): Curiosidade, Confusao intrigada, Determinacao (+50-100%)
   - Tier 3 (avoid): Sorriso generico, Neutra (+0-20%)

   **Eye Direction:**
   - Direct contact: Personal connection, opinions
   - Looking at object: Reviews, tutorials, reveals
   - Off-camera: Mystery, storytelling

   **Face Composition:**
   - Size: 30-50% of thumbnail
   - Position: Rule of thirds (off-center)
   - Crop: Above eyebrows to below chin

   - Validation: Expression matches emotion, eyes direct attention

5. **Apply Text Hierarchy Framework**

   **The 3-Word Rule:**
   - Maximum 3 words
   - If image alone communicates concept, NO TEXT
   - If text needed, prefer NUMBERS over words

   **High-Impact Text Types:**
   - Numbers: "$1M", "24H", "100%" (highest impact)
   - Questions: "COMO?", "POR QUE?" (high)
   - Negatives: "NAO", "PARE", "ERRO" (high)
   - Superlatives: "MELHOR", "MAIOR" (medium)

   **Typography Rules:**
   - Font: Bold, sans-serif (Impact, Bebas Neue, Anton)
   - Size: 15-25% of thumbnail height
   - Contrast: Extreme contrast with background (stroke/shadow)

   - Validation: Text is 3 words or less (or none)

6. **Apply Color Psychology Framework**

   **High-CTR Combinations:**
   - Tier 1: Amarelo/Preto, Vermelho/Branco, Azul/Laranja (+50-100%)
   - Tier 2: Verde neon/Preto, Rosa/Azul escuro, Laranja/Azul marinho (+30-50%)

   **Color Rules:**
   - 60% dominant, 30% secondary, 10% accent
   - Test in both dark mode and light mode
   - Avoid YouTube red (competes with UI)
   - Skin tones must contrast with background

   - Validation: Colors tested in both modes

7. **Conduct Internal Glance Test**
   - Show each concept for 0.5 seconds to test subjects
   - Ask: "What is this video about?"
   - Ask: "Would you click? Why/why not?"
   - Score each concept (0-10)

   **Scoring:**
   - Instant Recognition: 0-3 points
   - Emotional Response: 0-3 points
   - Curiosity Gap: 0-4 points

   **Threshold:**
   - 8-10: Ready to publish
   - 6-7: Minor adjustments
   - 4-5: Refazer conceito
   - 0-3: Start over

   - Validation: Top 3-5 concepts score 8+

8. **Prepare Test Sequence**
   - Rank concepts by Glance Test score
   - Define initial thumbnail (highest scorer)
   - Define Backup 1, 2, 3
   - Document swap triggers

   - Validation: Test sequence documented

## Output

- **concept-batch.yaml**: All 10-20 concepts with descriptions
- **glance-test-scores.yaml**: Scoring for each concept
- **test-sequence.md**: Publication order and swap triggers
- **production-requirements.md**: Photo/asset needs for execution

### Output Format (concept-batch.yaml)

```yaml
video:
  title: "Como acordar as 5am todo dia"
  content_type: "tutorial"
  primary_emotion: "curiosidade"
  secondary_emotion: "aspiracao"

concepts:
  - id: 1
    category: "curiosidade"
    description: "Rosto de choque olhando para relogio 5:00"
    face: true
    expression: "surpresa/choque"
    eye_direction: "looking_at_object"
    text: null
    colors:
      primary: "preto"
      secondary: "amarelo"
    glance_score: 8.5

  - id: 2
    category: "aspiracao"
    description: "Split screen: cansado vs energizado"
    face: true
    expression: "contraste emocional"
    eye_direction: "camera"
    text: "30 DIAS"
    colors:
      primary: "azul"
      secondary: "laranja"
    glance_score: 8.0

test_sequence:
  initial: 1
  backup_1: 2
  backup_2: 3
  swap_trigger: "CTR < 6% after 2h"
```

## Success Criteria

- [ ] Minimum 10 concepts generated
- [ ] All concepts pass Glance Test Layer 1 (recognition)
- [ ] Primary emotion clearly visible in top concepts
- [ ] Top 3 concepts score 8+/10
- [ ] Zero concepts use sorriso generico as default
- [ ] Text is 3 words or less (or none) in all concepts
- [ ] Colors have sufficient contrast for mobile
- [ ] Test sequence documented with swap triggers

## Error Handling

- **No face assets available**: Pivot to object/text-focused concepts
- **Glance Test scores all below 6**: Revisit emotion selection, check title alignment
- **Too many similar concepts**: Enforce category diversity requirements
- **Color contrast fails**: Use contrast checker, apply stroke/shadow

## Security Considerations

- Thumbnails must not be clickbait (misrepresent content)
- Emotion must match actual video content
- Numbers/claims must be truthful
- Follow YouTube Community Guidelines

## Examples

### Example 1: Tutorial Video

**Video:** "Como acordar as 5am todo dia"
**Content Type:** Tutorial
**Emotion:** Curiosidade + Aspiracao

**Top Concepts:**
1. Rosto de choque + relogio 5:00 (8.5/10)
2. Split screen cansado/energizado (8.0/10)
3. "30 DIAS" + expressao determinada (7.5/10)

**Test Sequence:**
- Initial: #1 (highest potential)
- Backup 1: #2 (aspiracional)
- Swap if CTR < 6% after 2h

### Example 2: Review Video

**Video:** "iPhone 15 Pro - VALE A PENA?"
**Content Type:** Review
**Emotion:** Controversia + Curiosidade

**Top Concepts:**
1. Expressao de confusao + iPhone em mao (8.0/10)
2. iPhone vs Samsung side-by-side + cara de desprezo (7.5/10)
3. "ERRO?" + iPhone com X vermelho (7.5/10)

## Notes

- "Pretty thumbnails get compliments from designers. Ugly thumbnails that work get views."
- Always test concepts, never publish just one
- Curiosity is the safest default emotion for any niche
- The thumbnail and title are ONE system - they complement, not repeat
- Mobile view is the primary test - if it doesn't work at 160x90px, it doesn't work
