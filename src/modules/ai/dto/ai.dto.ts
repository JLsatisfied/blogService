import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export type AiMode = 'continue' | 'polish' | 'summarize' | 'translate' | 'outline' | 'chat';

export class AiStreamDto {
  @IsString()
  @IsNotEmpty({ message: 'mode 不能为空' })
  @IsIn(['continue', 'polish', 'summarize', 'translate', 'outline', 'chat'], {
    message: 'mode 必须是 continue | polish | summarize | translate | outline | chat',
  })
  mode: AiMode;

  /** 编辑器中的全文（用于续写、总结等需要上下文的场景） */
  @IsString()
  @IsOptional()
  content?: string;

  /** 用户选中的文本片段（润色、翻译时优先使用） */
  @IsString()
  @IsOptional()
  selectedText?: string;

  /** 翻译目标语言，仅 translate 模式有效 */
  @IsString()
  @IsOptional()
  targetLang?: string;

  /** 大纲主题，仅 outline 模式有效 */
  @IsString()
  @IsOptional()
  topic?: string;

  /** 用户自定义提问，chat 模式时使用 */
  @IsString()
  @IsOptional()
  question?: string;
}
