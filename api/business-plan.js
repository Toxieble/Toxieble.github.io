let businessPlans = [];

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, contact, phone, type, description } = req.body;

    if (!name || !contact || !phone) {
      return res.status(400).json({ error: '缺少必填字段' });
    }

    const newPlan = {
      id: Date.now(),
      name,
      contact,
      phone,
      type: type || '其他',
      description: description || '',
      create_time: new Date().toISOString()
    };

    businessPlans.unshift(newPlan);

    return res.json({
      success: true,
      message: '方案提交成功',
      data: newPlan
    });
  } else if (req.method === 'GET') {
    const { id } = req.query;
    
    if (id) {
      const plan = businessPlans.find(p => p.id === parseInt(id));
      if (!plan) {
        return res.status(404).json({ error: '方案不存在' });
      }
      return res.json(plan);
    }

    return res.json(businessPlans);
  } else if (req.method === 'PUT') {
    const { id } = req.query;
    const { name, contact, phone, type, description } = req.body;

    const index = businessPlans.findIndex(p => p.id === parseInt(id));
    if (index === -1) {
      return res.status(404).json({ error: '方案不存在' });
    }

    businessPlans[index] = {
      ...businessPlans[index],
      name: name || businessPlans[index].name,
      contact: contact || businessPlans[index].contact,
      phone: phone || businessPlans[index].phone,
      type: type || businessPlans[index].type,
      description: description || businessPlans[index].description,
      update_time: new Date().toISOString()
    };

    return res.json({
      success: true,
      message: '方案修改成功',
      data: businessPlans[index]
    });
  } else if (req.method === 'DELETE') {
    const { id } = req.query;

    const index = businessPlans.findIndex(p => p.id === parseInt(id));
    if (index === -1) {
      return res.status(404).json({ error: '方案不存在' });
    }

    businessPlans.splice(index, 1);

    return res.json({
      success: true,
      message: '方案删除成功'
    });
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
