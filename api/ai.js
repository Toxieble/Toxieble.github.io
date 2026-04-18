export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: '缺少消息内容' });
  }

  const apiKey = process.env.DOUBAO_API_KEY;

  if (!apiKey) {
    const defaultResponses = [
      '聚烯烃市场近期表现较为稳定，建议关注原油价格走势对下游产品的影响。',
      '当前PP市场价格处于相对低位，适合适量囤货。',
      'PE需求旺季即将到来，价格有望回升。',
      '建议密切关注国际油价动态，做好风险管理。',
      '近期EVA市场供应偏紧，价格可能维持高位。'
    ];
    
    const response = {
      choices: [{
        message: {
          content: defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
        }
      }]
    };
    
    return res.json(response);
  }

  try {
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "doubao-pro-4k",
        messages: [{ role: "user", content: message }]
      })
    });

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error('AI API调用失败:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
}
