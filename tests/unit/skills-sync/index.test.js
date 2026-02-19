'use strict';

const path = require('path');

const {
  buildAgentSpecsFromParsedAgents,
  buildTaskSpecsFromParsedTasks,
  buildAgentSkillPlan,
  buildTaskSkillPlan,
} = require('../../../.aios-core/infrastructure/scripts/skills-sync');

describe('skills-sync shared pipeline', () => {
  it('sorts AgentSpec list by id deterministically', () => {
    const parsedAgents = [
      { id: 'qa', filename: 'qa.md', agent: { title: 'QA' }, commands: [] },
      { id: 'architect', filename: 'architect.md', agent: { title: 'Architect' }, commands: [] },
    ];

    const specs = buildAgentSpecsFromParsedAgents(parsedAgents);
    expect(specs.map((spec) => spec.id)).toEqual(['architect', 'qa']);
  });

  it('sorts TaskSpec list by id deterministically', () => {
    const parsedTasks = [
      { id: 'z-task', filename: 'z-task.md', title: 'Z Task' },
      { id: 'a-task', filename: 'a-task.md', title: 'A Task' },
    ];

    const specs = buildTaskSpecsFromParsedTasks(parsedTasks);
    expect(specs.map((spec) => spec.id)).toEqual(['a-task', 'z-task']);
  });

  it('sorts skill plans by skill id deterministically', () => {
    const skillsDir = path.join('/tmp', 'skills');
    const agentPlan = buildAgentSkillPlan(
      [
        { id: 'qa', filename: 'qa.md', metadata: {}, commands: [] },
        { id: 'architect', filename: 'architect.md', metadata: {}, commands: [] },
      ],
      skillsDir,
    );
    const taskPlan = buildTaskSkillPlan(
      [
        { id: 'z-task', filename: 'z-task.md', title: 'Z Task', agent: 'qa' },
        { id: 'a-task', filename: 'a-task.md', title: 'A Task', agent: 'po' },
      ],
      skillsDir,
    );

    expect(agentPlan.map((item) => item.skillId)).toEqual(['architect', 'qa']);
    expect(taskPlan.map((item) => item.skillId)).toEqual(['po-a-task', 'qa-z-task']);
  });
});
