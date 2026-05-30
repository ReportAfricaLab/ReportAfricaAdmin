import { Controller, Get, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('history')
  getHistory(@Request() req: any, @Query('page') page?: string) {
    return this.service.getHistory(req.user.id, Number(page) || 1);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Request() req: any) {
    return this.service.markAsRead(id, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('read-all')
  markAllAsRead(@Request() req: any) {
    return this.service.markAllAsRead(req.user.id);
  }
}
