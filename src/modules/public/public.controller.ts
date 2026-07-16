import { Controller, Get, Post, Body, Query, Res, HttpCode } from '@nestjs/common';
import type { Response } from 'express';
import { Public as PublicDecorator } from '../../common/decorators/public.decorator';
import { PublicService } from './public.service';
import { AiService } from '../ai/ai.service';
import { AiStreamDto } from '../ai/dto/ai.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@PublicDecorator()
@Controller('pc')
export class PublicController {
  constructor(
    private readonly publicService: PublicService,
    private readonly aiService: AiService,
  ) {}

  @Get()
  healthCheck() {
    return this.publicService.healthCheck();
  }

  // ─── PC User ────────────────────────────────────────────

  @Post('adduser')
  registerUser(@Body() body: { name: string; email: string; password: string }) {
    return this.publicService.registerUser(body);
  }

  @Post('getuser')
  loginUser(@Body() body: { email: string; password: string }) {
    return this.publicService.loginUser(body);
  }

  // ─── Messages ────────────────────────────────────────────

  @Post('addMessage')
  submitMessage(
    @Body()
    body: {
      name: string;
      username: string;
      imgage?: string;
      value: string;
      type?: string;
    },
  ) {
    return this.publicService.submitMessage(body);
  }

  @Get('searchMsg')
  findApprovedMessages(@Query() query: PaginationDto) {
    return this.publicService.findApprovedMessages(query.page, query.pageSize);
  }

  @Get('searchMsgAdmins')
  findAdminInfo() {
    return this.publicService.findAdminInfo();
  }

  @Get('searchMsgAdminsLeft')
  findLeftSidebarInfo() {
    return this.publicService.findLeftSidebarInfo();
  }

  // ─── Articles ────────────────────────────────────────────

  @Get('getTextLits')
  findArticles(@Query() query: PaginationDto) {
    return this.publicService.findArticles(query.page, query.pageSize);
  }

  @Get('getText')
  findArticleDetail(@Query('id') id: string) {
    return this.publicService.findArticleDetail(id);
  }

  @Get('latelyGetText')
  findLatestArticles() {
    return this.publicService.findLatestArticles();
  }

  @Get('hotGetText')
  findHotArticles() {
    return this.publicService.findHotArticles();
  }

  @Get('getTextDataLits')
  findArticlesByDate(@Query() query: PaginationDto) {
    return this.publicService.findArticlesByDate(query.page, query.pageSize);
  }

  @Get('getabout')
  findAbout() {
    return this.publicService.findAbout();
  }

  // ─── Labels ──────────────────────────────────────────────

  @Get('getTableAll')
  findAllLabels() {
    return this.publicService.findAllLabels();
  }

  @Get('tableGetText')
  findArticlesByLabel(
    @Query('id') id: string,
    @Query() query: PaginationDto,
  ) {
    return this.publicService.findArticlesByLabel(id, query.page, query.pageSize);
  }

  @Get('tableNames')
  findLabelName(@Query('id') id: string) {
    return this.publicService.findLabelName(id);
  }

  // ─── Projects ────────────────────────────────────────────

  @Get('getProjectList')
  findAllProjects() {
    return this.publicService.findAllProjects();
  }

  // ─── Manuals ─────────────────────────────────────────────

  @Get('getManual')
  findAllManuals() {
    return this.publicService.findAllManuals();
  }

  @Get('getManualPage')
  findManualsPaginated(@Query() query: PaginationDto) {
    return this.publicService.findManualsPaginated(query.page, query.pageSize);
  }

  @Get('getManualTxts')
  findManualDetail(@Query('id') id: string) {
    return this.publicService.findManualDetail(id);
  }

  // ─── Resume ──────────────────────────────────────────────

  @Get('getExperience')
  findAllResume() {
    return this.publicService.findAllResume();
  }

  // ─── AI Assistant ────────────────────────────────────────

  @Post('ai/stream')
  @HttpCode(200)
  async aiStream(@Body() dto: AiStreamDto, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    try {
      const generator = this.aiService.streamChat(dto.mode, {
        content: dto.content,
        selectedText: dto.selectedText,
        targetLang: dto.targetLang,
        topic: dto.topic,
        question: dto.question,
      });

      for await (const chunk of generator) {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }
    } catch (err: any) {
      res.write(`data: ${JSON.stringify({ text: `错误：${err.message}` })}\n\n`);
    } finally {
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
}
