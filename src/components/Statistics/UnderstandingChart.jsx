import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#f87171', '#fbbf24', '#34d399', '#60a5fa'];
const RADIAN = Math.PI / 180;

const UnderstandingChart = ({ data }) => {
  // Process data for Pie chart
  const processPieData = () => {
    if (!data || data.length === 0) return [];
    
    // Aggregate understanding levels across all steps
    const levelCounts = [0, 0, 0, 0]; // Levels 1-4
    
    data.forEach(step => {
      if (step.understood > 0) {
        // Add to levels 3-4 (well understood)
        levelCounts[2] += step.understood * 0.3; // Level 3
        levelCounts[3] += step.understood * 0.7; // Level 4
      }
      
      if (step.notUnderstood > 0) {
        // Add to levels 1-2 (not well understood)
        levelCounts[0] += step.notUnderstood * 0.4; // Level 1
        levelCounts[1] += step.notUnderstood * 0.6; // Level 2
      }
    });
    
    return [
      { name: '이해하지 못함', value: Math.round(levelCounts[0]) },
      { name: '약간 이해함', value: Math.round(levelCounts[1]) },
      { name: '대체로 이해함', value: Math.round(levelCounts[2]) },
      { name: '완전히 이해함', value: Math.round(levelCounts[3]) }
    ];
  };
  
  // Custom label for pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return percent > 0.05 ? (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };
  
  // Process data for Bar chart
  const processBarData = () => {
    if (!data || data.length === 0) return [];
    
    return data.map(item => ({
      name: item.name,
      이해함: item.understandingRate,
      이해못함: 100 - item.understandingRate
    }));
  };
  
  const pieData = processPieData();
  const barData = processBarData();
  
  return (
    <div className="understanding-charts">
      <div className="chart-row">
        <div className="chart-container pie-chart">
          <h3>전체 이해도 분포</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="chart-container bar-chart">
          <h3>단계별 이해도</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={barData}
              layout="vertical"
              margin={{
                top: 20,
                right: 30,
                left: 150,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis type="category" dataKey="name" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="이해함" stackId="a" fill="#4ade80" />
              <Bar dataKey="이해못함" stackId="a" fill="#f87171" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default UnderstandingChart; 