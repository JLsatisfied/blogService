import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import {
  CreateArticleDto,
  UpdateArticleMetaDto,
  UpdateArticleContentDto,
  ArticleIdDto,
  ChangeArticleClassDto,
} from './dto/create-article.dto';
import { QueryArticleDto } from './dto/query-article.dto';

@Controller('admin')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post('addTexts')
  create(@Body() dto: CreateArticleDto) {
    return this.articlesService.create(dto);
  }

  @Get('searchTextList')
  findPublished(@Query() query: QueryArticleDto) {
    return this.articlesService.findPublished(
      query.page,
      query.pageSize,
      query.name,
      query.class,
    );
  }

  @Get('searchTextListDraft')
  findDrafts(@Query() query: QueryArticleDto) {
    return this.articlesService.findDrafts(query.page, query.pageSize);
  }

  @Post('updataTextLabel')
  updateMeta(@Body() dto: UpdateArticleMetaDto) {
    return this.articlesService.updateMeta(dto);
  }

  @Post('updataTexts')
  updateContent(@Body() dto: UpdateArticleContentDto) {
    return this.articlesService.updateContent(dto.id, dto.text);
  }

  @Post('deleteText')
  remove(@Body() dto: ArticleIdDto) {
    return this.articlesService.remove(dto.id);
  }

  @Get('tetxShows')
  findOne(@Query('id') id: string) {
    return this.articlesService.findOne(id);
  }

  @Post('textMin')
  unpin(@Body() dto: ArticleIdDto) {
    return this.articlesService.unpin(dto.id);
  }

  @Post('textMax')
  pin(@Body() dto: ArticleIdDto) {
    return this.articlesService.pin(dto.id);
  }

  @Post('textRelease')
  publish(@Body() dto: ArticleIdDto) {
    return this.articlesService.publish(dto.id);
  }

  @Post('textClass')
  changeClass(@Body() dto: ChangeArticleClassDto) {
    return this.articlesService.changeClass(dto.id, dto.class);
  }
}
