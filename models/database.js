let visitor_needs = [];
let price_query_log = [];
let chat_history = [];
let price_cache = {};
let business_plans = [];

const initDatabase = () => {
  return Promise.resolve();
};

const insertVisitorNeed = (data) => {
  const newRecord = {
    id: Date.now(),
    ...data,
    create_time: new Date().toISOString()
  };
  visitor_needs.unshift(newRecord);
  return Promise.resolve({ id: newRecord.id });
};

const insertPriceQueryLog = (data) => {
  const newRecord = {
    id: Date.now(),
    username: data.username || '匿名',
    query_type: data.query_type,
    result: JSON.stringify(data.result),
    create_time: new Date().toISOString()
  };
  price_query_log.unshift(newRecord);
  return Promise.resolve({ id: newRecord.id });
};

const insertChatHistory = (data) => {
  const newRecord = {
    id: Date.now(),
    username: data.username || '匿名',
    question: data.question,
    answer: data.answer,
    create_time: new Date().toISOString()
  };
  chat_history.unshift(newRecord);
  return Promise.resolve({ id: newRecord.id });
};

const getVisitorNeeds = () => {
  return Promise.resolve(visitor_needs);
};

const getPriceQueryLogs = () => {
  return Promise.resolve(price_query_log);
};

const getChatHistory = () => {
  return Promise.resolve(chat_history);
};

const updatePriceCache = (productType, price, change) => {
  price_cache[productType] = {
    product_type: productType,
    price: price,
    change: change,
    update_time: new Date().toISOString()
  };
  return Promise.resolve({ id: Date.now() });
};

const getPriceCache = (productType) => {
  return Promise.resolve(price_cache[productType] || null);
};

const getPriceStats = () => {
  return Promise.resolve(Object.values(price_cache));
};

const deleteVisitorNeed = (id) => {
  visitor_needs = visitor_needs.filter(item => item.id !== parseInt(id));
  return Promise.resolve();
};

const insertBusinessPlan = (data) => {
  const newRecord = {
    id: Date.now(),
    ...data,
    create_time: new Date().toISOString()
  };
  business_plans.unshift(newRecord);
  return Promise.resolve({ id: newRecord.id });
};

const getBusinessPlans = () => {
  return Promise.resolve(business_plans);
};

const updateBusinessPlan = (id, data) => {
  const index = business_plans.findIndex(plan => plan.id === id);
  if (index !== -1) {
    business_plans[index] = {
      ...business_plans[index],
      ...data,
      update_time: new Date().toISOString()
    };
    return Promise.resolve({ success: true });
  }
  return Promise.resolve({ success: false });
};

const deleteBusinessPlan = (id) => {
  const index = business_plans.findIndex(plan => plan.id === id);
  if (index !== -1) {
    business_plans.splice(index, 1);
    return Promise.resolve({ success: true });
  }
  return Promise.resolve({ success: false });
};

module.exports = {
  initDatabase,
  insertVisitorNeed,
  insertPriceQueryLog,
  insertChatHistory,
  getVisitorNeeds,
  getPriceQueryLogs,
  getChatHistory,
  updatePriceCache,
  getPriceCache,
  getPriceStats,
  deleteVisitorNeed,
  insertBusinessPlan,
  getBusinessPlans,
  updateBusinessPlan,
  deleteBusinessPlan
};