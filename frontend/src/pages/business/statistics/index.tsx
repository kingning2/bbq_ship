import React, { useEffect, useState, useRef } from 'react';
import { Card, Row, Col, Statistic, Table } from 'antd';
import * as echarts from 'echarts';
import { getStatistics, StatisticsData } from '@/apis/statistics';
import { useOrderSocket } from '@/hooks/useOrderSocket';
import styles from './index.module.less';

const StatisticsPage: React.FC = () => {
  const chartRef = useRef<echarts.ECharts>();
  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: res } = await getStatistics();
      if (res.code === 200) {
        setData(res.data);
        initChart(res.data.trend);
      }
    } catch (err) {
      console.error('Failed to load statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    return () => {
      // 组件卸载时销毁图表
      if (chartRef.current) {
        chartRef.current.dispose();
      }
    };
  }, []);

  // 使用 WebSocket 实时更新数据
  useOrderSocket(loadData);

  // 初始化图表
  const initChart = (trend: StatisticsData['trend']) => {
    const chartDom = document.getElementById('trend-chart');
    if (!chartDom) return;

    // 如果已经存在图表实例，先销毁
    if (chartRef.current) {
      chartRef.current.dispose();
    }

    const myChart = echarts.init(chartDom, 'dark');
    chartRef.current = myChart;

    const option = {
      backgroundColor: '#141414',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      legend: {
        data: ['销售额', '利润', '订单数'],
        textStyle: {
          color: '#ffd700'
        }
      },
      grid: {
        top: 60,
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: trend.map(item => item.date),
          axisLine: {
            lineStyle: {
              color: '#303030'
            }
          },
          axisLabel: {
            color: '#fff'
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '金额',
          position: 'left',
          axisLine: {
            lineStyle: {
              color: '#303030'
            }
          },
          axisLabel: {
            formatter: '{value} 元',
            color: '#fff'
          },
          splitLine: {
            lineStyle: {
              color: '#303030'
            }
          }
        },
        {
          type: 'value',
          name: '订单数',
          position: 'right',
          axisLine: {
            lineStyle: {
              color: '#303030'
            }
          },
          axisLabel: {
            formatter: '{value}',
            color: '#fff'
          },
          splitLine: {
            show: false
          }
        }
      ],
      series: [
        {
          name: '销售额',
          type: 'line',
          smooth: true,
          data: trend.map(item => item.totalAmount),
          itemStyle: {
            color: '#ffd700'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(255, 215, 0, 0.3)'
              },
              {
                offset: 1,
                color: 'rgba(255, 215, 0, 0.1)'
              }
            ])
          }
        },
        {
          name: '利润',
          type: 'line',
          smooth: true,
          data: trend.map(item => item.profit),
          itemStyle: {
            color: '#ff4d4f'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(255, 77, 79, 0.3)'
              },
              {
                offset: 1,
                color: 'rgba(255, 77, 79, 0.1)'
              }
            ])
          }
        },
        {
          name: '订单数',
          type: 'bar',
          yAxisIndex: 1,
          data: trend.map(item => item.orderCount),
          itemStyle: {
            color: '#1890ff'
          }
        }
      ]
    };

    myChart.setOption(option);

    // 监听窗口大小变化，调整图表大小
    const resizeHandler = () => {
      myChart.resize();
    };
    window.addEventListener('resize', resizeHandler);

    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  };

  // 热销商品表格列配置
  const columns = [
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '销量',
      dataIndex: 'soldQuantity',
      key: 'soldQuantity',
      sorter: (a: any, b: any) => a.soldQuantity - b.soldQuantity,
    },
    {
      title: '销售额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      sorter: (a: any, b: any) => a.totalAmount - b.totalAmount,
      render: (val: number) => `¥${val.toFixed(2)}`,
    },
  ];

  return (
    <div className={styles.container}>
      {/* 概览数据 */}
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card title="今日数据" loading={loading}>
            <Statistic title="订单数" value={data?.today.orderCount || 0} />
            <Statistic 
              title="销售额" 
              value={data?.today.totalAmount || 0} 
              prefix="¥"
              precision={2}
            />
            <Statistic 
              title="利润(不含优惠)" 
              value={data?.today.profit || 0}
              prefix="¥"
              precision={2}
            />
            <Statistic 
              title="成本" 
              value={data?.today ? data?.today.totalAmount - data?.today.profit : 0}
              prefix="¥"
              precision={2}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="本周数据" loading={loading}>
            <Statistic title="订单数" value={data?.week.orderCount || 0} />
            <Statistic 
              title="销售额" 
              value={data?.week.totalAmount || 0}
              prefix="¥"
              precision={2}
            />
            <Statistic 
              title="利润(不含优惠)" 
              value={data?.week.profit || 0}
              prefix="¥"
              precision={2}
            />
            <Statistic 
              title="成本" 
              value={data?.week ? data?.week.totalAmount - data?.week.profit : 0}
              prefix="¥"
              precision={2}
            />  
          </Card>
        </Col>
        <Col span={8}>
          <Card title="本月数据" loading={loading}>
            <Statistic title="订单数" value={data?.month.orderCount || 0} />
            <Statistic 
              title="销售额" 
              value={data?.month.totalAmount || 0}
              prefix="¥"
              precision={2}
            />
            <Statistic 
              title="利润(不含优惠)" 
              value={data?.month.profit || 0}
              prefix="¥"
              precision={2}
            />
            <Statistic 
              title="成本" 
              value={data?.month ? data?.month.totalAmount - data?.month.profit : 0}
              prefix="¥"
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      {/* 销售趋势图 */}
      <Card title="销售趋势" className={styles.chart} loading={loading}>
        <div id="trend-chart" style={{ height: '450px' }} />
      </Card>

      {/* 热销商品榜 */}
      <Card title="热销商品TOP10" loading={loading}>
        <Table
          columns={columns}
          dataSource={data?.hotProducts || []}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default StatisticsPage; 