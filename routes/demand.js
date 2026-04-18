const express = require('express');
const router = express.Router();
const db = require('../models/database');

router.post('/', async (req, res) => {
  const { username, phone, email, demand_type, content } = req.body;
  
  if (!username || !phone) {
    return res.status(400).json({ error: '姓名和电话为必填项' });
  }

  try {
    const result = await db.insertVisitorNeed({
      username,
      phone,
      email: email || '',
      demand_type: demand_type || '其他',
      content: content || ''
    });
    
    res.json({
      success: true,
      message: '提交成功！我们已收到您的需求，将尽快与您联系。',
      id: result.id
    });
  } catch (err) {
    res.status(500).json({ error: '提交失败，请稍后重试' });
  }
});

router.get('/', async (req, res) => {
  try {
    const needs = await db.getVisitorNeeds();
    res.json(needs);
  } catch (err) {
    res.status(500).json({ error: '获取数据失败' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  
  try {
    await db.deleteVisitorNeed(id);
    res.json({ success: true, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ error: '删除失败' });
  }
});

module.exports = router;