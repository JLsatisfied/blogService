import { Controller, Get, Post, Body } from '@nestjs/common';
import { SettingsService } from './settings.service';
import {
  InitSettingsDto,
  UpdateSettingsDto,
  UpdateEmailPassDto,
} from './dto/create-setting.dto';

@Controller('admin')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post('setSets')
  initSettings(@Body() dto: InitSettingsDto) {
    return this.settingsService.initSettings(dto);
  }

  @Get('searchSetAll')
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Post('undataSetAll')
  updateSettings(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(dto);
  }

  @Post('undataSetPass')
  updateEmailPass(@Body() dto: UpdateEmailPassDto) {
    return this.settingsService.updateEmailPass(dto.emailpassword);
  }
}
