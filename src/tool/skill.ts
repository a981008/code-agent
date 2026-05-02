import { Tool } from './types';
import { skillLoader } from '../skill/loader';
import { Skill } from '../skill/types';

export class SkillTool extends Tool {
  name = 'skill';
  description =
    'Manage and load skills - list all available skills or load a specific skill by name';

  input_schema = {
    type: 'object' as const,
    properties: {
      action: {
        type: 'string',
        description:
          'Action to perform: "list" to list all skills, "load" to load a specific skill',
        enum: ['list', 'load'],
      },
      name: {
        type: 'string',
        description: 'Name of the skill to load (required when action is "load")',
      },
    },
    required: ['action'],
  };

  async execute(input: Record<string, unknown>): Promise<string> {
    const action = String(input.action || 'list');

    if (action === 'load') {
      const name = String(input.name || '');
      if (!name) {
        return 'Error: skill name is required when action is "load"';
      }

      const skill = skillLoader.get(name);
      if (!skill) {
        return `Skill "${name}" not found. Use action "list" to see available skills.`;
      }

      const prompt = skill.getPrompt();
      return `[skill] ${skill.name}\n\n${prompt}`;
    }

    // Default action: list
    const skills = skillLoader.list();

    if (skills.length === 0) {
      return 'No skills loaded.';
    }

    const lines = skills.map(s => `- ${s.name}: ${s.description}`);
    return `Available skills (${skills.length}):\n${lines.join('\n')}`;
  }
}
