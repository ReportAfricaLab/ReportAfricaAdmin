import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { StrictThrottlerGuard } from '../../common/guards/throttle.guard';

@Controller('reports')
@UseGuards(StrictThrottlerGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @Throttle({ short: { ttl: 60000, limit: 5 } })
  create(@Request() req: any, @Body() dto: CreateReportDto) {
    return this.reportsService.create(req.user.id, req.user.country, dto);
  }

  @Get('feed')
  getFeed(
    @Query('country') country: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('sort') sort?: string,
  ) {
    return this.reportsService.getFeed(
      country,
      Number(page) || 1,
      Number(limit) || 20,
      lat ? Number(lat) : undefined,
      lng ? Number(lng) : undefined,
      sort,
    );
  }

  @Get('nearby')
  getNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
    @Query('page') page?: string,
  ) {
    return this.reportsService.getNearby(
      Number(lat),
      Number(lng),
      Number(radius) || 10,
      Number(page) || 1,
    );
  }

  @Get('category/:category')
  getByCategory(
    @Param('category') category: string,
    @Query('country') country: string,
    @Query('page') page?: string,
  ) {
    return this.reportsService.getByCategory(country, category, Number(page) || 1);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportsService.findById(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/upvote')
  @Throttle({ short: { ttl: 60000, limit: 10 } })
  upvote(@Param('id') id: string) {
    return this.reportsService.upvote(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/downvote')
  @Throttle({ short: { ttl: 60000, limit: 10 } })
  downvote(@Param('id') id: string) {
    return this.reportsService.downvote(id);
  }
}
