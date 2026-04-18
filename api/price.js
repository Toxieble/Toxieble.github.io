export default async function handler(req, res) {
  const { product } = req.query;
  
  const basePriceData = {
    PP: { basePrice: 7620, change: 0.4, unit: '元/吨' },
    PE: { basePrice: 7850, change: -0.2, unit: '元/吨' },
    原油: { basePrice: 86.5, change: 1.2, unit: '美元/桶' },
    EVA: { basePrice: 8230, change: 0.8, unit: '元/吨' }
  };

  let realtimePriceData = {};
  Object.keys(basePriceData).forEach(p => {
    realtimePriceData[p] = {
      ...basePriceData[p],
      price: basePriceData[p].basePrice + (Math.random() - 0.5) * basePriceData[p].basePrice * 0.02
    };
    realtimePriceData[p].price = parseFloat(realtimePriceData[p].price.toFixed(p === '原油' ? 1 : 0));
    realtimePriceData[p].change = parseFloat((realtimePriceData[p].change + (Math.random() - 0.5) * 0.2).toFixed(2));
  });

  if (product) {
    if (!realtimePriceData[product]) {
      return res.status(400).json({ error: '未知产品类型' });
    }

    const data = realtimePriceData[product];
    const prediction = getPrediction(product, data.change);

    res.json({
      title: `${product}价格查询结果`,
      price: `${data.price}${data.unit}`,
      change: data.change >= 0 ? `+${data.change}%` : `${data.change}%`,
      period: '3日/7日',
      prediction: prediction.conclusion,
      risk: prediction.risk,
      suggestion: prediction.suggestion
    });
  } else {
    const result = {
      timestamp: new Date().toISOString(),
      data: {}
    };

    Object.keys(realtimePriceData).forEach(p => {
      const data = realtimePriceData[p];
      result.data[p] = {
        price: data.price,
        change: data.change,
        unit: data.unit,
        basePrice: data.basePrice
      };
    });

    res.json(result);
  }
}

const getPrediction = (product, change) => {
  const predictions = {
    PP: {
      conclusion: change > 0 ? '偏强震荡' : '震荡偏弱',
      risk: '中等',
      suggestion: change > 0 ? '锁价10%-20%' : '观望为主'
    },
    PE: {
      conclusion: change > 0 ? '稳中有升' : '震荡偏弱',
      risk: change > 0 ? '中等' : '中等偏高',
      suggestion: change > 0 ? '适量囤货' : '观望为主'
    },
    原油: {
      conclusion: '高位波动',
      risk: '高',
      suggestion: '谨慎囤货'
    },
    EVA: {
      conclusion: change > 0 ? '小幅上行' : '偏弱震荡',
      risk: '中等',
      suggestion: change > 0 ? '锁价20%' : '观望'
    }
  };
  return predictions[product] || predictions.PP;
};
