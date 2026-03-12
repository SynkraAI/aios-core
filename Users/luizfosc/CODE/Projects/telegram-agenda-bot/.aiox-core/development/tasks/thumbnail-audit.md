# Audit Existing Thumbnails and Identify Improvements

> Task ID: paddy-thumbnail-audit
> Agent: Paddy Galloway (YouTube Thumbnail Strategist)
> Version: 1.0.0

## Description

Systematically audit existing YouTube channel thumbnails to identify CTR issues, pattern problems, and improvement opportunities. Uses the Glance Test Framework to score thumbnails and the Emotion Hierarchy to diagnose emotional effectiveness.

**Core Principle:** "Impressions without clicks is just YouTube showing you what could have been."

## Prerequisites

- Access to YouTube Studio analytics
- Channel with at least 10 published videos
- Permission to view CTR data
- Thumbnail files or screenshots available

## Workflow

### Interactive Elicitation

1. **Gather Channel Information**
   - What is the channel URL or name?
   - What niche/category is the channel?
   - How many videos should we audit? (recommend last 20)
   - What is the channel's average CTR?

2. **Identify Performance Tiers**
   - Which videos have the highest CTR? (top 20%)
   - Which videos have the lowest CTR? (bottom 20%)
   - What's the CTR gap between top and bottom performers?

3. **Access Confirmation**
   - Can you export CTR data per video?
   - Are thumbnail files accessible for visual analysis?

### Steps

1. **Collect Performance Data**

   **Required Data Per Video:**
   - Video title
   - Thumbnail (visual)
   - CTR percentage
   - Impressions count
   - Views count
   - Publish date

   **Export Format:**
   ```
   | Video | CTR | Impressions | Views | Date |
   |-------|-----|-------------|-------|------|
   ```

   - Validation: Data collected for all target videos

2. **Establish Channel Benchmarks**

   **Calculate:**
   - Average CTR across all videos
   - Median CTR (less affected by outliers)
   - Top 20% CTR threshold
   - Bottom 20% CTR threshold

   **Compare to Niche:**

   | Niche | Low CTR | Average | Good | Excellent |
   |-------|---------|---------|------|-----------|
   | Entertainment | <6% | 8-12% | 12-15% | 15%+ |
   | Educational | <4% | 5-8% | 8-12% | 12%+ |
   | Tech Review | <3% | 4-6% | 6-10% | 10%+ |
   | Vlog | <2% | 3-5% | 5-8% | 8%+ |

   - Validation: Channel position vs niche documented

3. **Apply Glance Test to Each Thumbnail**

   **Scoring Protocol:**
   - Show thumbnail for 0.5 seconds
   - Score Layer 1 (Recognition): 0-3 points
   - Score Layer 2 (Emotion): 0-3 points
   - Score Layer 3 (Curiosity): 0-4 points
   - Total: 0-10 points

   **Glance Test Matrix:**
   ```
   | Video | CTR | L1 | L2 | L3 | Total | Correlation |
   |-------|-----|----|----|----| ------|-------------|
   ```

   - Validation: All thumbnails scored

4. **Map Emotions to Performance**

   **Emotion Categories:**
   - Curiosidade
   - Controversia
   - Aspiracao
   - Medo/Urgencia
   - Felicidade/Neutra

   **Analysis Questions:**
   - What emotion does each thumbnail convey?
   - Does the emotion match the content type?
   - What's the CTR correlation per emotion?

   **Expected Pattern:**
   - Curiosidade: Highest CTR average
   - Controversia: High CTR average
   - Aspiracao: Medium-high CTR
   - Felicidade: Low CTR average
   - Neutra: Lowest CTR average

   - Validation: Emotion-CTR correlation documented

5. **Analyze Face Usage**

   **Face Audit Metrics:**
   - % of thumbnails WITH face
   - % of thumbnails WITHOUT face
   - Average CTR with face vs without

   **Expression Analysis:**
   ```
   | Expression Type | Count | Avg CTR | vs Channel Avg |
   |-----------------|-------|---------|----------------|
   | Surpresa/Choque | N | X% | +Y% |
   | Curiosidade | N | X% | +Y% |
   | Determinacao | N | X% | +Y% |
   | Sorriso Generico | N | X% | -Y% |
   | Neutra | N | X% | -Y% |
   ```

   **Eye Direction Analysis:**
   - Direct camera
   - Looking at object
   - Off-camera

   - Validation: Face patterns documented

6. **Analyze Text Usage**

   **Text Audit Metrics:**
   - % with text vs without
   - Average word count
   - CTR correlation with word count

   **Text Type Breakdown:**
   ```
   | Text Type | Count | Avg CTR | Example |
   |-----------|-------|---------|---------|
   | Numbers | N | X% | "$1M", "30 DIAS" |
   | Questions | N | X% | "COMO?" |
   | Negatives | N | X% | "ERRO", "NAO" |
   | Descriptive | N | X% | "Tutorial" |
   | None | N | X% | - |
   ```

   - Validation: Text patterns documented

7. **Analyze Color Patterns**

   **Color Audit:**
   - Dominant color per thumbnail
   - Contrast level (high/medium/low)
   - Consistency with channel brand

   **High-Performer Colors:**
   - Document colors used in top 20% CTR videos
   - Document colors used in bottom 20% CTR videos
   - Identify winning color combinations

   - Validation: Color patterns documented

8. **Identify Pattern Problems**

   **Common Issues to Check:**
   - [ ] Sorriso generico as default (>50% of thumbs)
   - [ ] Expressoes muito sutis (low Glance L2 scores)
   - [ ] Texto demais (>3 words average)
   - [ ] Cores sem contraste (low visibility)
   - [ ] Falta de curiosidade (low Glance L3 scores)
   - [ ] Rostos muito pequenos (<20% of frame)
   - [ ] Thumbnail repete titulo
   - [ ] Emocao nao combina com conteudo

   - Validation: All issues checked and documented

9. **Generate Prioritized Recommendations**

   **Priority Matrix:**

   | Impact | Effort | Priority |
   |--------|--------|----------|
   | High CTR gain | Low effort | P0 - Do First |
   | High CTR gain | High effort | P1 - Plan |
   | Low CTR gain | Low effort | P2 - Quick Wins |
   | Low CTR gain | High effort | P3 - Defer |

   **Recommendation Categories:**
   1. Expression changes (usually P0)
   2. Text optimization (usually P0-P1)
   3. Color/contrast improvements (usually P1)
   4. Composition changes (usually P1-P2)
   5. Complete redesign (usually P2-P3)

   - Validation: Recommendations prioritized

10. **Create Before/After Opportunities**

    **Select Top 5 Improvement Candidates:**
    - Highest impression count + lowest CTR
    - These have biggest upside potential
    - Document specific changes recommended

    - Validation: 5 candidates identified

## Output

- **thumbnail-audit-report.yaml**: Complete audit data
- **performance-matrix.md**: CTR vs Glance scores correlation
- **pattern-analysis.md**: Identified problems and patterns
- **recommendations.md**: Prioritized improvement list
- **before-after-candidates.md**: Top 5 videos to re-thumbnail

### Output Format (thumbnail-audit-report.yaml)

```yaml
audit_metadata:
  channel_name: "[Channel]"
  audit_date: "2026-02-02"
  videos_analyzed: 20
  date_range: "Last 6 months"

channel_benchmarks:
  average_ctr: 4.2%
  median_ctr: 3.8%
  top_20_threshold: 6.5%
  bottom_20_threshold: 2.5%
  niche: "educational"
  niche_average: 6%
  gap_to_niche: -1.8%

emotion_distribution:
  felicidade:
    count: 8
    percentage: 40%
    avg_ctr: 3.2%
  curiosidade:
    count: 5
    percentage: 25%
    avg_ctr: 6.1%
  neutra:
    count: 4
    percentage: 20%
    avg_ctr: 2.9%
  controversia:
    count: 2
    percentage: 10%
    avg_ctr: 5.8%
  aspiracao:
    count: 1
    percentage: 5%
    avg_ctr: 4.5%

face_analysis:
  with_face_count: 12
  without_face_count: 8
  avg_ctr_with_face: 4.8%
  avg_ctr_without_face: 3.4%

  expression_breakdown:
    sorriso_generico: { count: 5, avg_ctr: 3.5% }
    surpresa: { count: 3, avg_ctr: 6.8% }
    neutra: { count: 2, avg_ctr: 2.8% }
    determinacao: { count: 2, avg_ctr: 5.2% }

text_analysis:
  with_text_count: 14
  without_text_count: 6
  avg_word_count: 4.2

  text_type_breakdown:
    numbers: { count: 3, avg_ctr: 5.9% }
    descriptive: { count: 8, avg_ctr: 3.4% }
    questions: { count: 2, avg_ctr: 5.1% }
    negatives: { count: 1, avg_ctr: 6.2% }

problems_identified:
  - problem: "Sorriso generico overused"
    severity: "high"
    affected_videos: 5
    ctr_impact: "-2.6% vs channel average"

  - problem: "Text too long (>3 words)"
    severity: "medium"
    affected_videos: 8
    ctr_impact: "-1.2% vs channel average"

recommendations:
  p0_immediate:
    - "Replace sorriso generico with surpresa/curiosidade"
    - "Reduce text to 3 words max"

  p1_planned:
    - "Implement high-contrast color scheme"
    - "Increase face size to 30-50% of frame"

before_after_candidates:
  - video_id: "xxx"
    title: "Video with high impressions, low CTR"
    impressions: 50000
    current_ctr: 2.1%
    potential_ctr: 6%+
    changes_needed: ["expression", "text", "color"]
```

## Success Criteria

- [ ] All target videos audited with Glance scores
- [ ] Emotion mapping complete with CTR correlation
- [ ] Face/expression patterns documented
- [ ] Text usage patterns documented
- [ ] Top 3 recurring problems identified
- [ ] Prioritized recommendations created
- [ ] Top 5 re-thumbnail candidates selected
- [ ] Actionable next steps defined

## Error Handling

- **No CTR data available**: Request access or use view/impression ratio
- **Too few videos**: Audit what's available, note limited sample
- **No clear patterns**: Increase sample size or segment by content type
- **All CTR is low**: Compare to niche, may be title/topic issue not thumbnail

## Security Considerations

- Audit honestly - don't hide poor performers
- Learn from failures, they teach more than successes
- Document patterns objectively, not subjectively
- Respect data privacy if auditing other channels

## Examples

### Example 1: Educational Channel Audit

**Finding:** 40% of thumbnails use sorriso generico
**CTR Impact:** -2.6% vs curiosidade thumbnails
**Recommendation:** Shift default expression to surpresa/curiosidade

### Example 2: Tech Review Channel

**Finding:** Average text length is 5.2 words
**CTR Impact:** -1.8% vs thumbnails with <3 words
**Recommendation:** Strict 3-word max, prefer numbers over words

## Notes

- "The difference between 5% and 15% CTR is the difference between 100K and 300K views on the same video."
- Patterns in failures teach more than successes
- High impression + low CTR = biggest opportunity
- Audit quarterly to prevent pattern regression
- Share learnings with team to prevent repeated mistakes
