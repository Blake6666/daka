/**
 * /api/health —— Day 15 最小健康检查云函数
 *
 * 它只回答一个问题：这条「公网 → 云函数」的链路通不通。
 *
 * 刻意什么都不做：
 *   - 不连数据库（数据库是 Day 16 的事）
 *   - 不读环境变量、不写业务逻辑、不碰任何数据
 *
 * 因为今天要验证的不是「功能对不对」，而是「AI 写的东西能不能真的部署上去、
 * 并被公网访问到」。功能一旦复杂，出错就分不清是链路问题还是业务问题。
 *
 * 返回用「集成响应」格式（官方文档：返回值里带 statusCode 就会被识别为集成响应）。
 * 这样状态码和 Content-Type 都是我们明确写死的，不依赖平台的默认推断。
 * 后面 Day 17~22 的业务接口沿用同一套写法。
 */

exports.main = async () => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ok: true })
  };
};
