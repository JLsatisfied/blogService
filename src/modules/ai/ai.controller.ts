import { Controller, Post, Body, Res, HttpCode } from '@nestjs/common';
import type { Response } from 'express';
import { AiService } from './ai.service';
import { AiStreamDto } from './dto/ai.dto';

@Controller('admin')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * SSE streaming endpoint for AI writing assistant.
   * POST /admin/ai/stream
   */
  @Post('ai/stream')
  @HttpCode(200)
  async stream(@Body() dto: AiStreamDto, @Res() res: Response) {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // disable nginx buffering
    res.flushHeaders();

    try {
      const generator = this.aiService.streamChat(dto.mode, {
        content: dto.content,
        selectedText: dto.selectedText,
        targetLang: dto.targetLang,
        topic: dto.topic,
      });

      for await (const chunk of generator) {
        // SSE format: "data: <content>\n\n"
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }
    } catch (err: any) {
      res.write(`data: ${JSON.stringify({ text: `服务器错误：${err.message}` })}\n\n`);
    } finally {
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
}
