# Structure A/B Tests for Thumbnail Optimization

> Task ID: paddy-thumbnail-ab-testing
> Agent: Paddy Galloway (YouTube Thumbnail Strategist)
> Version: 1.0.0

## Description

Create a rigorous A/B testing plan for YouTube thumbnails using Paddy Galloway's ABC Testing Framework (Always Be Comparing). This task structures the testing protocol, monitoring cadence, swap triggers, and documentation requirements.

**Core Principle:** "The thumbnail you think will win almost never does. Test everything."

## Prerequisites

- Thumbnail concepts generated (minimum 5, ideal 10-20)
- Access to YouTube Studio analytics
- Understanding of niche CTR benchmarks
- Variants ready for quick swap (pre-uploaded if possible)

## Workflow

### Interactive Elicitation

1. **Gather Test Context**
   - How many thumbnail variants are ready to test?
   - What is your niche's average CTR? (use benchmarks if unknown)
   - What time/day are you publishing?
   - Is this a high-stakes video (product launch, milestone)?

2. **Define Success Metrics**
   - Target CTR for this video
   - Minimum acceptable CTR (swap trigger)
   - Secondary metrics to monitor (AVD, impressions)

3. **Confirm Monitoring Availability**
   - Can you check analytics every 30-60 min for first 4 hours?
   - Who will execute the swap if needed?

### Steps

1. **Validate Variant Diversity**

   **ABC Philosophy:**
   - A - Always have alternatives ready
   - B - Be prepared to swap rapidly
   - C - Comparing data, not opinions

   **Diversity Check:**
   - [ ] Variants are DRASTICALLY different (not subtle tweaks)
   - [ ] At least 2 different emotions represented
   - [ ] At least 1 with face, 1 without face
   - [ ] At least 1 with text, 1 without text
   - [ ] Color schemes vary significantly

   **What to Vary (Good):**
   - Angle/perspective
   - Primary emotion
   - Text presence/absence
   - Face presence/absence
   - Color scheme
   - Composition (close vs wide)
   - Curiosity element

   **What NOT to Vary Alone (Bad):**
   - Button color
   - Font choice (same text)
   - Subtle position changes
   - Saturation/brightness only

   - Validation: Variants pass diversity check

2. **Establish CTR Benchmarks**

   **Niche Benchmarks (Reference):**

   | Niche | Average CTR | Good CTR | Excellent CTR |
   |-------|-------------|----------|---------------|
   | Entertainment | 8-12% | 12-15% | 15%+ |
   | Educational | 5-8% | 8-12% | 12%+ |
   | Tech Review | 4-6% | 6-10% | 10%+ |
   | Vlog | 3-5% | 5-8% | 8%+ |
   | How-to | 4-7% | 7-10% | 10%+ |

   - Define: Target CTR = [niche good + 20%]
   - Define: Alarm CTR = [niche average - 20%]
   - Define: Swap Trigger = [below alarm for 2h]

   - Validation: Benchmarks documented

3. **Create Test Sequence**

   **Ranking Criteria:**
   - Glance Test scores
   - Internal feedback preference
   - Gut check (tie-breaker only)

   **Test Sequence Template:**
   ```
   INITIAL: [Variant A] - Highest Glance Test score
   BACKUP 1: [Variant B] - Different emotion than A
   BACKUP 2: [Variant C] - Different format (text/no-text swap)
   BACKUP 3: [Variant D] - Radical alternative
   ```

   - Validation: Sequence of 4+ variants documented

4. **Define Monitoring Protocol**

   **Phase 1: Launch (0-2h)**
   - Check every 30 minutes
   - Record: CTR, impressions, views
   - Note: CTR trend (rising/falling/stable)
   - Decision point at 2h mark

   **Phase 2: Early Decision (2-4h)**
   - Check every 60 minutes
   - Compare CTR to benchmark
   - Execute swap if below alarm
   - Document reason for swap

   **Phase 3: Settling (4-24h)**
   - Check every 2-4 hours
   - CTR typically stabilizes
   - Final swap opportunity
   - Document performance

   **Phase 4: Analysis (24-48h)**
   - Compare all tested variants
   - Document learnings
   - Archive for future reference

   - Validation: Monitoring schedule confirmed

5. **Define Swap Triggers**

   **Automatic Swap Triggers:**

   | Condition | Action |
   |-----------|--------|
   | CTR < Alarm for 2h | Swap to Backup 1 |
   | CTR declining >20% | Swap to Backup 1 |
   | Impressions stalled | Check title, then swap |
   | All variants <Alarm | Investigate title |

   **Manual Swap Triggers:**
   - Significant negative comments about thumbnail
   - Thumbnail displays incorrectly on mobile
   - Technical issues (cropping, resolution)

   **DO NOT Swap Based On:**
   - Personal preference
   - Single negative comment
   - Less than 1h of data
   - "Feeling" without data

   - Validation: Triggers documented

6. **Create Documentation Template**

   **Test Log Template:**
   ```
   VIDEO: [Title]
   PUBLISH DATE: [Date/Time]
   NICHE: [Category]
   TARGET CTR: [X%]
   ALARM CTR: [Y%]

   VARIANTS:
   - A (Initial): [Description]
   - B (Backup 1): [Description]
   - C (Backup 2): [Description]
   - D (Backup 3): [Description]

   TIMELINE:
   | Time | Variant | CTR | Impressions | Notes |
   |------|---------|-----|-------------|-------|
   | 0h   | A       | -   | -           | Launch |
   | 30m  | A       | X%  | NNN         | [Trend] |
   | 1h   | A       | X%  | NNN         | [Trend] |
   | 2h   | A→B     | X%  | NNN         | Swap: below alarm |
   | 4h   | B       | X%  | NNN         | [Trend] |
   | 24h  | B       | X%  | NNN         | Final |

   WINNER: [Variant]
   FINAL CTR: [X%]
   LEARNINGS: [What worked/didn't]
   ```

   - Validation: Log template ready

7. **Prepare Rapid Swap Process**

   **Pre-Upload All Variants:**
   - Upload all backup thumbnails to YouTube (save as draft)
   - Test display on mobile and desktop
   - Verify file naming for quick identification

   **Swap Execution:**
   1. Go to YouTube Studio > Video > Edit
   2. Click thumbnail > Upload custom
   3. Select backup variant
   4. Save immediately
   5. Hard refresh to verify

   **Time Target:** < 2 minutes per swap

   - Validation: All variants pre-uploaded or accessible

8. **Title-Thumbnail Alignment Check**

   **Before Testing:**
   - Thumbnail and title tell ONE story
   - Thumbnail does NOT repeat title
   - Promise in title matches emotion in thumbnail

   **If CTR Low Across ALL Variants:**
   - Problem may be TITLE, not thumbnail
   - Test title change before giving up on thumbnails
   - Thumbnail and title are ONE system

   - Validation: Title-thumbnail alignment confirmed

## Output

- **ab-test-plan.yaml**: Complete test plan with variants, sequence, triggers
- **test-log-template.md**: Documentation template for real-time tracking
- **monitoring-schedule.md**: Exact times to check analytics
- **swap-decision-tree.md**: Quick reference for swap decisions

### Output Format (ab-test-plan.yaml)

```yaml
test_metadata:
  video_title: "Como acordar as 5am todo dia"
  publish_date: "2026-02-03T10:00:00"
  niche: "productivity"

benchmarks:
  target_ctr: 8%
  minimum_acceptable: 6%
  alarm_trigger: 4%
  niche_average: 5.5%

variants:
  - id: "A"
    role: "initial"
    description: "Rosto de choque + relogio 5:00"
    emotion: "curiosidade"
    has_face: true
    has_text: false
    glance_score: 8.5

  - id: "B"
    role: "backup_1"
    description: "Split screen cansado/energizado"
    emotion: "aspiracao"
    has_face: true
    has_text: "30 DIAS"
    glance_score: 8.0

  - id: "C"
    role: "backup_2"
    description: "Relogio 5:00 com '?' grande"
    emotion: "curiosidade"
    has_face: false
    has_text: "?"
    glance_score: 7.5

test_sequence:
  initial: "A"
  backup_order: ["B", "C"]

swap_triggers:
  - condition: "CTR < 4% for 2h"
    action: "swap_to_backup_1"
  - condition: "CTR declining >20%"
    action: "swap_to_backup_1"
  - condition: "all_variants_below_alarm"
    action: "investigate_title"

monitoring_schedule:
  phase_1:
    duration: "0-2h"
    frequency: "30min"
    decision_point: true
  phase_2:
    duration: "2-4h"
    frequency: "60min"
    decision_point: true
  phase_3:
    duration: "4-24h"
    frequency: "2-4h"
    decision_point: false
  phase_4:
    duration: "24-48h"
    action: "final_analysis"
```

## Success Criteria

- [ ] Minimum 4 variants in test sequence
- [ ] Variants are drastically different (not subtle tweaks)
- [ ] CTR benchmarks defined with niche context
- [ ] Swap triggers clearly documented
- [ ] Monitoring schedule realistic and committed
- [ ] All variants pre-uploaded for rapid swap
- [ ] Title-thumbnail alignment verified
- [ ] Test log template ready for documentation

## Error Handling

- **Not enough variants**: Generate more before publishing
- **No CTR benchmark data**: Use conservative estimates, test to discover
- **Unable to monitor first 4h**: Delay publication if possible
- **All variants fail**: Focus on title, not just thumbnails
- **Thumbnail uploads rejected**: Check file size (<2MB), dimensions (1280x720)

## Security Considerations

- Test real performance data, not opinions
- Document honestly (even failures teach)
- Don't swap based on ego ("I liked that one")
- Learn from failures, don't hide them

## Examples

### Example 1: High-Stakes Launch

**Video:** Product launch video
**Stakes:** High (revenue impact)
**Approach:** Extra variants, tighter monitoring

```yaml
variants: 6
monitoring_phase_1: every 15min
swap_trigger: CTR < target for 1h
pre_uploaded: yes (all 6)
```

### Example 2: Regular Upload

**Video:** Weekly content
**Stakes:** Standard
**Approach:** Standard protocol

```yaml
variants: 4
monitoring_phase_1: every 30min
swap_trigger: CTR < alarm for 2h
pre_uploaded: yes (all 4)
```

## Notes

- "MrBeast tests 20+ thumbnail concepts before every video. That's not overkill, that's the standard."
- Data decides, not opinions. Let CTR make the choice.
- First 2-4 hours tell you everything. Stay vigilant.
- The difference between 5% and 15% CTR is the difference between 100K and 300K views.
- If your CTR is below niche average, change the thumbnail, not the title (unless ALL variants fail).
