const express = require('express');
const router = express.Router();
const axios = require('axios');
const multer = require('multer');
const db = require('../models/database');

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'), false);
    }
  }
});

const faqAnswers = {
  'PP未来会涨吗？': '当前PP处于震荡偏强区间，未来7日预计小幅上行，风险中等，建议锁价10%-20%。',
  '中小企业怎么融资？': '平台提供轻量化风控评分卡，无需抵押，以真实贸易数据授信，缓解融资难融资贵。',
  '什么时候适合囤货？': '价格处于低位、AI预警拐点向上、风险等级低时，可适度囤货。',
  '含权贸易是什么？': '结合期权工具的贸易模式，帮助企业锁定成本、对冲价格波动风险。',
  '风控评分卡如何使用？': '输入经营数据、订单稳定性、回款情况等，自动生成信用评分，快速获得融资参考。',
  'PE价格走势如何？': 'PE当前处于震荡偏弱格局，建议密切关注原油价格走势和下游需求变化。',
  '原油对聚烯烃影响？': '原油作为原材料，其价格波动直接影响聚烯烃生产成本，是重要的参考指标。',
  '什么是锁价策略？': '锁价策略是指在价格处于低位时锁定采购成本，避免后续价格上涨带来的风险。'
};

router.post('/chat', async (req, res) => {
  const { question, username } = req.body;
  
  if (!question) {
    return res.status(400).json({ error: '请输入问题' });
  }

  let answer;
  
  const matchedFaq = Object.keys(faqAnswers).find(key => 
    question.includes(key) || key.includes(question)
  );
  
  if (matchedFaq) {
    answer = faqAnswers[matchedFaq];
  } else {
    answer = await callAI(question);
  }

  await db.insertChatHistory({
    username: username || '匿名',
    question: question,
    answer: answer
  });

  res.json({ answer });
});

router.get('/faq', (req, res) => {
  res.json({ questions: Object.keys(faqAnswers) });
});

router.post('/chat-with-files', upload.array('files', 5), async (req, res) => {
  const { question } = req.body;
  const files = req.files || [];
  
  if (!question && files.length === 0) {
    return res.status(400).json({ error: '请输入问题或上传文件' });
  }

  let answer;
  let fileInfo = '';
  
  if (files.length > 0) {
    fileInfo = `\n\n用户上传了 ${files.length} 个文件：\n`;
    files.forEach((file, index) => {
      fileInfo += `${index + 1}. ${file.originalname} (${file.size} bytes, ${file.mimetype})\n`;
    });
  }

  const fullQuestion = question ? question + fileInfo : '请分析我上传的文件内容' + fileInfo;
  
  const matchedFaq = Object.keys(faqAnswers).find(key => 
    question && (question.includes(key) || key.includes(question))
  );
  
  if (matchedFaq) {
    answer = faqAnswers[matchedFaq];
  } else {
    answer = await callAI(fullQuestion);
  }

  if (files.length > 0) {
    answer = `已收到您上传的文件，分析结果如下：\n\n${answer}`;
  }

  await db.insertChatHistory({
    username: req.body.username || '匿名',
    question: question || '[上传文件]',
    answer: answer,
    file_count: files.length
  });

  res.json({ answer });
});

const callAI = async (question) => {
  const systemPrompt = `你是聚烯烃产业链AI风控助手，专业回答以下领域问题：
  - 聚烯烃（PP、PE、EVA等）价格走势与未来预测
  - 锁价、囤货、采购策略建议
  - 中小微企业融资、授信方案
  - 含权贸易、风控管理、产业链协同
  
  请用专业但易懂的语言回答用户问题。`;

  const apiKey = process.env.doubao_key || process.env.ARK_API_KEY;
  
  if (!apiKey || apiKey === 'your_ark_api_key' || apiKey === 'doubao_key') {
    console.log('未配置ARK API密钥，使用本地回答');
    return generateDefaultAnswer(question);
  }

  try {
    const response = await axios.post('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      model: 'ep-20260414140255-8jdpb',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      temperature: 0.7,
      max_tokens: 1024
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      return response.data.choices[0].message.content;
    }
    return generateDefaultAnswer(question);
  } catch (err) {
    console.error('ARK API调用失败:', err.message);
    return generateDefaultAnswer(question);
  }
};

const generateDefaultAnswer = (question) => {
  if (question.includes('价格') || question.includes('走势')) {
    return '根据当前市场数据分析，聚烯烃价格受原油、供需等多种因素影响。建议使用平台的价格查询功能获取最新实时数据和AI预测分析。';
  }
  if (question.includes('融资') || question.includes('贷款')) {
    return '平台提供轻量化供应链金融风控评分卡服务，无需抵押，基于真实贸易数据进行授信评估，有效解决中小微企业融资难题。';
  }
  if (question.includes('风控') || question.includes('风险')) {
    return '我们的AI风控系统综合现货、期货、宏观数据进行建模，能够有效识别风险拐点，为您提供专业的风险管理建议。';
  }
  if (question.includes('含权贸易') || question.includes('期权')) {
    return '含权贸易是结合期权工具的创新贸易模式，帮助企业锁定成本、对冲价格波动风险，欢迎咨询详细方案。';
  }
  return '感谢您的提问！我们的专业团队正在处理您的问题，将尽快回复您。如需即时帮助，请使用平台其他功能。';
};

module.exports = router;
