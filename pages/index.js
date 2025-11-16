import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [tickers, setTickers] = useState('AAPL,MSFT,GOOGL,TSLA,NVDA');
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStockData = async () => {
    setLoading(true);
    const tickerList = tickers.split(',').map(t => t.trim());
    const data = [];

    for (const ticker of tickerList) {
      try {
        const response = await axios.get(
          `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=3mo`
        );
        
        const result = response.data.chart.result[0];
        const quote = result.meta;
        const prices = result.indicators.quote[0].close;
        
        data.push({
          ticker,
          price: quote.regularMarketPrice || 'N/A',
          change: ((quote.regularMarketPrice - quote.previousClose) / quote.previousClose * 100).toFixed(2),
          volume: quote.regularMarketVolume,
          chartData: prices.filter(p => p).map((p, i) => ({ price: p.toFixed(2) }))
        });
      } catch (error) {
        data.push({
          ticker,
          price: 'Error',
          change: 'N/A',
          volume: 'N/A',
          chartData: []
        });
      }
    }
    
    setStocks(data);
    setLoading(false);
  };

  return (
    <div style={{ backgroundColor: '#0e1117', color: '#fff', minHeight: '100vh', padding: '20px', fontFamily: 'Arial' }}>
      <h1>📈 Stock Market Dashboard</h1>
      
      <div style={{ marginBottom: '20px', backgroundColor: '#1e2130', padding: '15px', borderRadius: '10px' }}>
        <input
          type="text"
          value={tickers}
          onChange={(e) => setTickers(e.target.value)}
          placeholder="Enter tickers (comma-separated)"
          style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}
        />
        <button
          onClick={fetchStockData}
          style={{
            backgroundColor: '#4ade80',
            color: '#000',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Loading...' : 'Refresh Data'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {stocks.map((stock) => (
          <div key={stock.ticker} style={{ backgroundColor: '#1e2130', padding: '15px', borderRadius: '10px' }}>
            <h2>{stock.ticker}</h2>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>${stock.price}</p>
            <p style={{ color: stock.change > 0 ? '#4ade80' : '#ef4444' }}>
              {stock.change}%
            </p>
            <p style={{ fontSize: '12px', color: '#888' }}>Volume: {stock.volume}</p>
            
            {stock.chartData.length > 0 && (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={stock.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="price" stroke="#4ade80" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
