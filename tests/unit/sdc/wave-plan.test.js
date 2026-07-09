'use strict';

const { planWaveBatches } = require('../../../.aiox-core/core/sdc/wave-plan');

describe('wave-plan', () => {
  it('topo-sorts by depends_on', () => {
    const stories = [
      {
        storyId: 'B',
        dependsOn: ['A'],
        fileList: ['b.js'],
        path: 'b.md',
        status: 'Ready',
      },
      {
        storyId: 'A',
        dependsOn: [],
        fileList: ['a.js'],
        path: 'a.md',
        status: 'Ready',
      },
    ];
    const { batches, errors } = planWaveBatches(stories);
    expect(errors).toEqual([]);
    expect(batches[0].map((s) => s.storyId)).toEqual(['A']);
    expect(batches[1].map((s) => s.storyId)).toEqual(['B']);
  });

  it('sequences file-overlapping stories', () => {
    const stories = [
      {
        storyId: 'A',
        dependsOn: [],
        fileList: ['shared/x.js'],
        path: 'a.md',
        status: 'Ready',
      },
      {
        storyId: 'B',
        dependsOn: [],
        fileList: ['shared/x.js'],
        path: 'b.md',
        status: 'Ready',
      },
      {
        storyId: 'C',
        dependsOn: [],
        fileList: ['other/y.js'],
        path: 'c.md',
        status: 'Ready',
      },
    ];
    const { batches, errors } = planWaveBatches(stories);
    expect(errors).toEqual([]);
    // First batch: A and C can parallel (no overlap); B waits
    const batch1Ids = batches[0].map((s) => s.storyId).sort();
    expect(batch1Ids).toEqual(['A', 'C']);
    expect(batches[1].map((s) => s.storyId)).toEqual(['B']);
  });

  it('detects cycles', () => {
    const stories = [
      { storyId: 'A', dependsOn: ['B'], fileList: [], path: 'a.md', status: 'Ready' },
      { storyId: 'B', dependsOn: ['A'], fileList: [], path: 'b.md', status: 'Ready' },
    ];
    const { errors } = planWaveBatches(stories);
    expect(errors.length).toBeGreaterThan(0);
  });
});
