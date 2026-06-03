import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsString, IsOptional } from 'class-validator';
import { VoiceService } from './voice.service';

class TranscribeDto {
  @IsString() audioUrl: string;
  @IsString() @IsOptional() language?: string;
}

class TranslateDto {
  @IsString() text: string;
  @IsString() @IsOptional() targetLanguage?: string;
}

@Controller('voice')
export class VoiceController {
  constructor(private readonly service: VoiceService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('transcribe')
  transcribe(@Body() dto: TranscribeDto) {
    return this.service.processVoiceNote(dto.audioUrl, dto.language || 'en');
  }

  @Post('translate')
  async translate(@Body() dto: TranslateDto) {
    const translated = await this.service.translateToEnglish(dto.text, dto.targetLanguage || 'auto');
    return { originalText: dto.text, translatedText: translated };
  }
}
