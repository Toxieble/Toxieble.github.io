const express = require('express');
const router = express.Router();
const db = require('../models/database');

router.get('/', async (req, res) => {
  try {
    const plans = await db.getBusinessPlans();
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: '获取方案列表失败' });
  }
});

router.post('/', async (req, res) => {
  const { name, contact, phone, type, description, fileName } = req.body;
  
  if (!name || !contact || !phone) {
    return res.status(400).json({ error: '缺少必填字段' });
  }

  try {
    const result = await db.insertBusinessPlan({
      name,
      contact,
      phone,
      type: type || '其他',
      description: description || '',
      file_name: fileName || null
    });
    res.json({ success: true, id: result.id });
  } catch (err) {
    res.status(500).json({ error: '提交失败' });
  }
});

router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, contact, phone, type, description } = req.body;
  
  if (!name || !contact || !phone) {
    return res.status(400).json({ error: '缺少必填字段' });
  }

  try {
    const result = await db.updateBusinessPlan(id, {
      name,
      contact,
      phone,
      type: type || '其他',
      description: description || ''
    });
    
    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: '方案不存在' });
    }
  } catch (err) {
    res.status(500).json({ error: '修改失败' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  
  try {
    const result = await db.deleteBusinessPlan(id);
    
    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: '方案不存在' });
    }
  } catch (err) {
    res.status(500).json({ error: '删除失败' });
  }
});

module.exports = router;