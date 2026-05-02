import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Skill, SkillDefinition, SkillMetadata } from './types';

const GLOBAL_SKILL_DIR = path.join(os.homedir(), '.claude', 'skills');
const PROJECT_SKILL_DIR = path.join(process.cwd(), '.skills');

export class SkillLoader {
  private skills: Map<string, Skill> = new Map();

  constructor() {
    // Load global skills first, then local skills (local takes precedence on conflict)
    this.loadFromDirectorySync(GLOBAL_SKILL_DIR);

    // Also try project-level .skills/ in current working directory
    if (PROJECT_SKILL_DIR !== GLOBAL_SKILL_DIR) {
      this.loadFromDirectorySync(PROJECT_SKILL_DIR);
    }
  }

  private loadFromDirectorySync(dir: string): void {
    if (!fs.existsSync(dir)) {
      return;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const skillPath = path.join(dir, entry.name, 'SKILL.md');
        if (fs.existsSync(skillPath)) {
          this.loadFromFileSync(skillPath);
        }
      }
    }
  }

  private loadFromFileSync(filePath: string): void {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = this.parseSkillFile(content);

      if (!parsed) {
        return;
      }

      const definition: SkillDefinition = {
        name: parsed.metadata.name,
        description: parsed.metadata.description,
        prompt: parsed.fullPrompt,
        allowedTools: parsed.metadata.allowedTools,
        argumentHint: parsed.metadata.argumentHint,
        userInvocable: parsed.metadata.userInvocable,
        version: parsed.metadata.version,
      };

      const skill = new Skill(definition);
      this.skills.set(skill.name, skill);
    } catch (e) {
      console.error(`Failed to load skill from ${filePath}:`, e);
    }
  }

  private parseSkillFile(content: string): { metadata: SkillMetadata; fullPrompt: string } | null {
    const frontmatterMatch = content.match(/^---[\s\S]*?\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      return null;
    }

    const frontmatter = this.parseFrontmatter(frontmatterMatch[1]);
    if (!frontmatter.name || !frontmatter.description) {
      return null;
    }

    const body = content.slice(frontmatterMatch[0].length).trim();
    const allowedToolsRaw = frontmatter['allowed-tools'];
    const allowedTools = Array.isArray(allowedToolsRaw)
      ? (allowedToolsRaw as string[])
      : allowedToolsRaw
        ? [allowedToolsRaw as string]
        : [];

    const metadata: SkillMetadata = {
      name: frontmatter.name as string,
      description: frontmatter.description as string,
      allowedTools,
      argumentHint: frontmatter['argument-hint'] as string | undefined,
      userInvocable: String(frontmatter['user-invocable']) === 'true',
      version: frontmatter.version as string | undefined,
    };

    return { metadata, fullPrompt: body };
  }

  private parseFrontmatter(yaml: string): Record<string, string | string[]> {
    const result: Record<string, string | string[]> = {};
    const lines = yaml.split('\n');

    let lastKey = '';
    let pendingArrayKey = '';

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith('- ')) {
        const item = trimmed.slice(2).trim();
        if (pendingArrayKey) {
          const arr = (result[pendingArrayKey] as string[]) || [];
          arr.push(item);
          result[pendingArrayKey] = arr;
        } else if (lastKey) {
          const arr = (result[lastKey] as string[]) || [];
          arr.push(item);
          result[lastKey] = arr;
        }
      } else {
        const keyMatch = trimmed.match(/^(\w+(?:-\w+)*):/);
        if (keyMatch) {
          lastKey = keyMatch[1];
          const value = trimmed
            .slice(keyMatch[0].length)
            .trim()
            .replace(/^["']|["']$/g, '');
          if (value) {
            result[lastKey] = value;
          } else {
            pendingArrayKey = lastKey;
          }
        } else if (trimmed) {
          pendingArrayKey = '';
        }
      }
    }

    return result;
  }

  load(definition: SkillDefinition): Skill {
    const s = new Skill(definition);
    this.skills.set(s.name, s);
    return s;
  }

  get(name: string): Skill | undefined {
    return this.skills.get(name);
  }

  has(name: string): boolean {
    return this.skills.has(name);
  }

  list(): Skill[] {
    return Array.from(this.skills.values());
  }
}

export const skillLoader = new SkillLoader();
