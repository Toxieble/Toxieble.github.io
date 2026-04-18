const express = require('express');
const router = express.Router();
const db = require('../models/database');

router.get('/needs', async (req, res) => {
  try {
    const needs = await db.getVisitorNeeds();
    res.json(needs);
  } catch (err) {
    res.status(500).json({ error: '获取数据失败' });
  }
});

router.get('/logs', async (req, res) => {
  try {
    const logs = await db.getPriceQueryLogs();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: '获取数据失败' });
  }
});

router.get('/chat', async (req, res) => {
  try {
    const chats = await db.getChatHistory();
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: '获取数据失败' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const [needs, logs, chats] = await Promise.all([
      db.getVisitorNeeds(),
      db.getPriceQueryLogs(),
      db.getChatHistory()
    ]);
    
    res.json({
      totalNeeds: needs.length,
      totalLogs: logs.length,
      totalChats: chats.length,
      recentNeeds: needs.slice(0, 5),
      recentLogs: logs.slice(0, 5)
    });
  } catch (err) {
    res.status(500).json({ error: '获取数据失败' });
  }
});

router.delete('/needs/:id', async (req, res) => {
  const id = req.params.id;
  
  try {
    await db.deleteVisitorNeed(id);
    res.json({ success: true, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ error: '删除失败' });
  }
});

module.exports = router;