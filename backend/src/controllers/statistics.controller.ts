import { Controller, Get } from '@nestjs/common';
import { StatisticsService } from '../services/statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  async getStatistics() {
    return this.statisticsService.getStatistics();
  }
}
