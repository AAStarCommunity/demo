# Hotfix v0.3.1 - 移除自动升级逻辑

## 🐛 问题描述

demo.aastar.io 在执行无 Gas 交易前尝试自动升级账户到 V2,导致交易失败:

```
MetaMask - RPC Error: execution reverted
Transaction failed: transaction execution reverted
status: 0
```

**错误日志**:
```
Upgrading to SimpleAccountV2...
Upgrade tx: 0x850794dc910788c6b451134cc96d1f11369366606b6224fc98abb089e13e8a7b
Gasless transaction error: Error: transaction execution reverted
```

## 🔍 根本原因

1. **错误的架构决策**: 在 v0.3.0 中实现了自动升级现有 V1 账户到 V2 的逻辑
2. **权限问题**: UUPS 升级需要账户 owner 权限,但升级调用可能权限不足
3. **不必要的复杂性**: 新用户创建账户时不需要升级,应直接使用 V2 factory

## ✅ 解决方案

### 1. 移除自动升级逻辑
- **删除**: `checkAccountVersion()` 函数
- **删除**: `upgradeAccountToV2()` 函数  
- **删除**: 无 Gas 交易前的升级检查

### 2. 部署 SimpleAccountFactoryV2
- **Factory 地址**: `0x8B516A71c134a4b5196775e63b944f88Cc637F2b`
- **Implementation**: `0x174f4b95baf89E1295F1b3826a719F505caDD02A`
- **功能**: 直接创建支持 `personal_sign` 的 V2 账户

### 3. 更新配置
- 更新 `ContractInfo.tsx` 中的 factory 地址
- 更新文档中的合约地址表
- 更新环境变量配置

## 📦 版本对比

### v0.3.0 (有问题的版本)
```typescript
// ❌ 错误做法: 尝试升级现有账户
const { needsUpgrade } = await checkAccountVersion(aaAccount, provider);
if (needsUpgrade) {
  await upgradeAccountToV2(aaAccount, signer);
}
```

### v0.3.1 (修复版本)
```typescript
// ✅ 正确做法: 新账户直接使用 V2 factory
// Factory V2: 0x8B516A71c134a4b5196775e63b944f88Cc637F2b
// 创建的账户天然支持 personal_sign
```

## 🚀 部署流程

1. **回退代码**: 从 v0.3.0 tag 分支回退到 main
2. **部署 FactoryV2**: 使用 deployer 私钥部署新工厂合约
3. **更新配置**: 修改 demo 中的工厂地址
4. **本地测试**: 验证编译产物中无升级逻辑
5. **打 tag**: 创建 v0.3.1 标签
6. **推送**: 触发 Vercel 自动部署

## 📝 Git 历史

```bash
* 8471d44 (HEAD -> main, tag: v0.3.1) feat: update to SimpleAccountFactoryV2
| * 6d3bba1 (tag: v0.3.0) feat: add SimpleAccountV2 auto-upgrade ❌
|/
* 6e925ab fix: set beneficiary to AA owner address
```

## 🎯 用户影响

### 现有 V1 账户用户
- **选项 1**: 继续使用 V1 账户 (需在 MetaMask 开发者设置中启用 `eth_sign`)
- **选项 2**: 创建新的 V2 账户 (推荐)
- **不推荐**: 手动升级 (复杂且容易出错)

### 新用户
- ✅ 直接创建 V2 账户
- ✅ 天然支持 MetaMask `personal_sign`
- ✅ 无需任何额外配置

## 🔐 MetaMask 开发设置 (可选)

如果需要测试 V1 账户或 `eth_sign`:

1. 打开 MetaMask 设置
2. 高级 → 显示测试网络
3. 安全与隐私 → 启用 "Eth_sign 请求"

⚠️ **警告**: `eth_sign` 默认禁用是出于安全考虑,仅用于开发/测试。

## 📊 测试验证

### 本地构建验证
```bash
cd /Users/jason/Dev/mycelium/my-exploration/projects/demo
rm -rf dist
pnpm build
grep -r "Upgrading to SimpleAccountV2" dist/
# 输出: ✅ No upgrade logic found
```

### 部署后验证
1. 访问 https://demo.aastar.io
2. 创建新账户
3. 执行无 Gas 交易
4. 检查浏览器控制台无升级相关日志

## 🎉 预期结果

- ✅ 新账户直接支持 `personal_sign`
- ✅ 无 Gas 交易流程顺畅
- ✅ 无升级相关错误
- ✅ 签名兼容 MetaMask 默认设置

## 📅 时间线

- **2025-10-10 14:00**: 发现升级逻辑导致交易失败
- **2025-10-10 14:30**: 部署 SimpleAccountFactoryV2
- **2025-10-10 15:00**: 回退代码,移除升级逻辑
- **2025-10-10 15:15**: 本地测试通过
- **2025-10-10 15:20**: 推送 v0.3.1,触发 Vercel 部署

## 🔗 相关文档

- [SimpleAccountFactoryV2 部署摘要](../SuperPaymaster/docs/SimpleAccountFactoryV2-Deployment.md)
- [Demo README](./README.md)
- [合约地址更新](./CONTRACTS_UPDATE.md)

## 👨‍💻 负责人

- **发现问题**: @user
- **修复实施**: Claude Code Assistant
- **部署时间**: 2025-10-10
