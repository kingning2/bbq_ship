import request from '@/utils/request';
import type { ResponseData } from '@/types/common';

export interface StatisticsData {
  // 今日数据
  today: {
    orderCount: number;      // 订单数
    totalAmount: number;     // 总金额
    profit: number;         // 利润
  };
  // 本周数据
  week: {
    orderCount: number;
    totalAmount: number;
    profit: number;
  };
  // 本月数据
  month: {
    orderCount: number;
    totalAmount: number;
    profit: number;
  };
  // 销售趋势
  trend: {
    date: string;
    orderCount: number;
    totalAmount: number;
    profit: number;
  }[];
  // 热销商品
  hotProducts: {
    id: number;
    name: string;
    soldQuantity: number;
    totalAmount: number;
  }[];
}

// 获取统计数据
export const getStatistics = () => {
  return request.get<ResponseData<StatisticsData>>('/statistics');
}; 