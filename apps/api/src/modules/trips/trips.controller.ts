import { Controller, Post, Get, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsNumber, IsString, IsOptional } from 'class-validator';
import { TripsService } from './trips.service';

class StartTripDto {
  @IsString() sharedWithUsername: string;
  @IsNumber() latitude: number;
  @IsNumber() longitude: number;
  @IsString() @IsOptional() destination?: string;
}

class UpdateLocationDto {
  @IsNumber() latitude: number;
  @IsNumber() longitude: number;
}

@Controller('trips')
export class TripsController {
  constructor(private readonly service: TripsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('start')
  start(@Request() req: any, @Body() dto: StartTripDto) {
    return this.service.start(req.user.id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('update-location')
  updateLocation(@Request() req: any, @Body() dto: UpdateLocationDto) {
    return this.service.updateLocation(req.user.id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('end')
  end(@Request() req: any) {
    return this.service.end(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('active')
  getActive(@Request() req: any) {
    return this.service.getActive(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('watching')
  getWatching(@Request() req: any) {
    return this.service.getWatching(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/dangers')
  getDangers(@Request() req: any, @Param('id') id: string) {
    return this.service.getDangers(id, req.user.id);
  }
}
