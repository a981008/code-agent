export interface SkillDefinition {
  name: string;
  description: string;
  prompt?: string;
  allowedTools?: string[];
  argumentHint?: string;
  userInvocable?: boolean;
  version?: string;
}

export interface SkillMetadata {
  name: string;
  description: string;
  allowedTools: string[];
  argumentHint?: string;
  userInvocable: boolean;
  version?: string;
}

export class Skill implements SkillDefinition {
  name: string;
  description: string;
  prompt: string;
  allowedTools: string[];
  argumentHint?: string;
  userInvocable: boolean;
  version?: string;

  constructor(definition: SkillDefinition) {
    this.name = definition.name;
    this.description = definition.description;
    this.prompt = definition.prompt || '';
    this.allowedTools = definition.allowedTools || [];
    this.argumentHint = definition.argumentHint;
    this.userInvocable = definition.userInvocable ?? true;
    this.version = definition.version;
  }

  getMetadata(): SkillMetadata {
    return {
      name: this.name,
      description: this.description,
      allowedTools: this.allowedTools,
      argumentHint: this.argumentHint,
      userInvocable: this.userInvocable,
      version: this.version,
    };
  }

  getSystemPromptMetadata(): string {
    return `[skill] ${this.name}: ${this.description}`;
  }

  getPrompt(): string {
    return this.prompt;
  }
}
