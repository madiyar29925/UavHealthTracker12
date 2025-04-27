import React from 'react';
import { 
  Area, 
  AreaChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { format } from 'date-fns';
import { Telemetry } from '@shared/schema';

interface TelemetryChartProps {
  data: Telemetry[];
  dataKey: keyof Telemetry;
  stroke: string;
  fill: string;
  gradientId: string;
  gradientColor: string;
  unit: string;
}

const TelemetryChart: React.FC<TelemetryChartProps> = ({
  data,
  dataKey,
  stroke,
  fill,
  gradientId,
  gradientColor,
  unit
}) => {
  // Format data for chart display
  const chartData = data.slice().reverse().map((item) => ({
    ...item,
    formattedTime: format(new Date(item.timestamp), 'HH:mm:ss')
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={gradientColor} stopOpacity={0.2} />
            <stop offset="95%" stopColor={gradientColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis 
          dataKey="formattedTime" 
          tick={{ fontSize: 10 }}
          stroke="#9E9E9E"
          tickLine={{ stroke: '#E0E0E0' }}
          axisLine={{ stroke: '#E0E0E0' }}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10 }}
          stroke="#9E9E9E"
          tickLine={{ stroke: '#E0E0E0' }}
          axisLine={{ stroke: '#E0E0E0' }}
        />
        <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
        <Tooltip
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #E0E0E0',
            borderRadius: '4px',
            fontSize: '12px'
          }}
          labelStyle={{ fontWeight: 'bold', marginBottom: '5px' }}
          formatter={(value: any) => [`${value} ${unit}`, dataKey.toString()]}
          labelFormatter={(time) => `Time: ${time}`}
        />
        <Area 
          type="monotone" 
          dataKey={dataKey} 
          stroke={stroke} 
          fillOpacity={1} 
          fill={fill} 
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default TelemetryChart;
