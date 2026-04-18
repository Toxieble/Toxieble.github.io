let demandList = [];

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, phone, company, requirement, budget, timeline } = req.body;

    if (!name || !phone || !requirement) {
      return res.status(400).json({ error: '缺少必填字段' });
    }

    const newDemand = {
      id: Date.now(),
      name,
      phone,
      company: company || '',
      requirement,
      budget: budget || '',
      timeline: timeline || '',
      create_time: new Date().toISOString()
    };

    demandList.unshift(newDemand);

    return res.json({
      success: true,
      message: '需求提交成功',
      data: newDemand
    });
  } else if (req.method === 'GET') {
    return res.json(demandList);
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
