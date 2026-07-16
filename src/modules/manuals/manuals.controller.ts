import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ManualsService } from './manuals.service';
import {
  CreateManualDto,
  ManualIdDto,
  AddArticleToManualDto,
  RemoveArticleFromManualDto,
} from './dto/create-manual.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('admin')
export class ManualsController {
  constructor(private readonly manualsService: ManualsService) {}

  @Post('addManual')
  createOrUpdate(@Body() dto: CreateManualDto) {
    return this.manualsService.createOrUpdate(dto);
  }

  @Get('searchManual')
  findAll(@Query() query: PaginationDto) {
    return this.manualsService.findAll(query.page, query.pageSize);
  }

  @Get('searchTextListManual')
  findArticlesByManual(@Query() query: PaginationDto) {
    return this.manualsService.findArticlesByManual(query.page, query.pageSize);
  }

  @Post('addTextMan')
  addArticleToManual(@Body() dto: AddArticleToManualDto) {
    return this.manualsService.addArticleToManual(dto.manualId, dto.articleId);
  }

  @Get('searchManualLists')
  findManualArticleList(@Query('id') id: string) {
    return this.manualsService.findManualArticleList(id);
  }

  @Post('deleteManualname')
  remove(@Body() dto: ManualIdDto) {
    return this.manualsService.remove(dto.id);
  }

  @Post('deleteTextManListTxt')
  removeArticleFromManual(@Body() dto: RemoveArticleFromManualDto) {
    return this.manualsService.removeArticleFromManual(
      dto.manualId,
      dto.articleId,
    );
  }
}
