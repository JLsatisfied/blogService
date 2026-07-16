import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AiMode } from './dto/ai.dto';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiBase: string;
  private readonly apiKey: string;
  private readonly model: string;

  constructor(private config: ConfigService) {
    this.apiBase = this.config.get<string>(
      'AI_API_BASE',
      'https://api.openai.com/v1',
    );
    this.apiKey = this.config.get<string>('AI_API_KEY', '');
    this.model = this.config.get<string>('AI_MODEL', 'gpt-4o-mini');
  }

  /**
   * Build system + user prompts per mode.
   */
  private buildMessages(mode: AiMode, opts: {
    content?: string;
    selectedText?: string;
    targetLang?: string;
    topic?: string;
    question?: string;
  }): ChatMessage[] {
    const { content, selectedText, targetLang, topic, question } = opts;

    switch (mode) {
      case 'continue':
        return [
          {
            role: 'system',
            content:
              '你是一个专业的技术写作者。请根据用户已有的文章内容，用自然流畅的中文接续写作。保持与原文一致的风格、语气和专业深度。直接输出续写内容，不要加任何前缀说明。字数 200-500 字。',
          },
          {
            role: 'user',
            content: `请续写以下内容，保持风格一致：\n\n${(content || '').slice(-2000)}`,
          },
        ];

      case 'polish':
        return [
          {
            role: 'system',
            content: [
              '你是顶级文字编辑，只做一件事：把用户给的文本改写得更好。',
              '',
              '硬性要求：',
              '1. 永远不要原样返回——哪怕原文已经很好了，也必须做至少 3 处实质性修改',
              '2. 改完的文本必须和原文有明显差异（换词、换句式、换节奏）',
              '3. 如果原文是中文，改完必须是中文；英文同理',
              '4. 保留核心信息和语气，但不保留原句结构',
              '',
              '具体操作：',
              '- 把长句拆成短句，增强节奏感',
              '- 用精准动词替换"进行/实现/通过/利用"等虚词',
              '- 删掉可有可无的"的""了""吧""呢""是"',
              '- 把被动语态改主动，把倒装改正常语序',
              '- 如果原文冗长，大胆精简 20-30%',
              '- 如果原文太干，加入一个恰当的比喻或具象表达',
              '',
              '你只输出改写后的文本，不含任何解释、标记或前缀。',
            ].join('\n'),
          },
          {
            role: 'user',
            content: `把这段话改写得更出彩：\n\n${selectedText || content || ''}`,
          },
        ];

      case 'summarize':
        return [
          {
            role: 'system',
            content:
              '你是一个专业的内容总结专家。请用 3-5 个要点总结用户提供的文章内容，每个要点一句话。用中文输出，格式为 markdown 无序列表。',
          },
          {
            role: 'user',
            content: `请总结以下文章的核心要点：\n\n${(selectedText || content || '').slice(0, 5000)}`,
          },
        ];

      case 'translate':
        return [
          {
            role: 'system',
            content: [
              `你是专业${targetLang || '英文'}翻译。硬性规则：`,
              `1. 把用户给的文本完整翻译成${targetLang || '英文'}，一个字都不许漏`,
              `2. 输出必须和原文是不同语言——绝对禁止输出原文`,
              `3. 保留原文格式（段落、列表、标题层级）`,
              `4. 专业术语使用${targetLang || '英文'}中的行业标准译法`,
              `5. 保持原文语气和风格，但不保留原句结构`,
              '——只输出译文，不含解释、标记、前缀。',
            ].join('\n'),
          },
          {
            role: 'user',
            content: `翻译成${targetLang || '英文'}：\n\n${selectedText || content || ''}`,
          },
        ];

      case 'outline':
        return [
          {
            role: 'system',
            content:
              '你是一个专业的技术文章大纲规划师。请根据用户提供的主题或关键词，生成一个结构清晰的文章大纲。包含标题建议和各章节要点。用中文输出，格式为 markdown 层级标题 + 简短说明。',
          },
          {
            role: 'user',
            content: `请为以下主题生成文章大纲：${topic || content || '未指定主题'}`,
          },
        ];

      case 'chat':
        return [
          {
            role: 'system',
            content: [
              '你是一个专业的写作助手，帮助用户完成文章创作。',
              '回答问题时请参考文章上下文，给出有针对性的建议和内容。',
              '用中文回复，格式为 markdown。直接输出回答内容，不要加前缀说明。',
            ].join('\n'),
          },
          {
            role: 'user',
            content:
              `我的文章内容：\n\n${(content || '').slice(-2000)}\n\n我的问题：${opts.question || ''}`,
          },
        ];

      default:
        return [
          { role: 'system', content: '你是一个有帮助的写作助手。' },
          { role: 'user', content: content || '' },
        ];
    }
  }

  /**
   * Call AI API and yield chunks as an async generator.
   * Uses fetch() with streaming — compatible with OpenAI, DeepSeek, Claude (via OpenAI-compatible endpoint), etc.
   */
  async *streamChat(mode: AiMode, opts: {
    content?: string;
    selectedText?: string;
    targetLang?: string;
    topic?: string;
    question?: string;
  }): AsyncGenerator<string, void, undefined> {
    const messages = this.buildMessages(mode, opts);

    if (!this.apiKey) {
      yield '错误：未配置 AI_API_KEY 环境变量，请在 .env 中设置。';
      return;
    }

    this.logger.log(`AI request: mode=${mode}, model=${this.model}`);

    try {
      const response = await fetch(`${this.apiBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          stream: true,
          temperature: (mode === 'polish' || mode === 'translate') ? 1.0 : 0.7,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        this.logger.error(`AI API error: ${response.status} ${errText}`);
        yield response.status == 402 ? 'AI 接口错误 (402)：API Key 配额已用完，请检查账户余额或更换 API Key。' : `AI 接口错误 (${response.status})：请检查 API Key 和网络连接。`;
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        yield '错误：无法读取 AI 响应流。';
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE lines: "data: {...}\n\n"
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // keep incomplete line in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;

          const jsonStr = trimmed.slice(5).trim();
          if (jsonStr === '[DONE]') return;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed?.choices?.[0]?.delta?.content;
            if (delta) yield delta;
          } catch {
            // skip unparseable chunks
          }
        }
      }
    } catch (err: any) {
      this.logger.error(`AI stream error: ${err.message}`);
      yield `网络错误：${err.message}`;
    }
  }
}
