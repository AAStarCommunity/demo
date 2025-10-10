#!/bin/bash

echo "🔍 检查 Demo 应用部署状态"
echo "================================"

# 检查最新构建
echo "1. 检查构建产物..."
if [ -f "dist/index.html" ]; then
  echo "✓ 构建文件存在"
  
  # 检查是否包含 etherscan-link
  if grep -q "etherscan-link" dist/assets/*.css 2>/dev/null; then
    echo "✓ CSS 包含 etherscan-link 样式"
  else
    echo "✗ CSS 不包含 etherscan-link 样式"
  fi
  
  # 检查 ContractInfo 组件
  if grep -q "ContractInfo" dist/assets/*.js 2>/dev/null; then
    echo "✓ JS 包含 ContractInfo 组件"
  else
    echo "✗ JS 不包含 ContractInfo 组件"
  fi
else
  echo "✗ 构建文件不存在,需要重新构建"
fi

echo ""
echo "2. 检查源代码..."
if grep -q "etherscan-link" src/components/EndUserDemo.css; then
  echo "✓ 源代码包含 etherscan-link 样式"
else
  echo "✗ 源代码缺少 etherscan-link 样式"
fi

if [ -f "src/components/ContractInfo.tsx" ]; then
  echo "✓ ContractInfo.tsx 文件存在"
else
  echo "✗ ContractInfo.tsx 文件不存在"
fi

echo ""
echo "3. 测试 API 响应..."
RESPONSE=$(curl -s -X POST "https://faucet.aastar.io/api/mint" \
  -H "Content-Type: application/json" \
  -d '{"address":"0x3d5eD655f7d112e6420467504CcaaB397922c035","type":"pnt"}')

if echo "$RESPONSE" | grep -q "txHash"; then
  TX_HASH=$(echo "$RESPONSE" | grep -o '"txHash":"[^"]*"' | cut -d'"' -f4)
  echo "✓ API 返回了交易哈希: $TX_HASH"
  echo "✓ 交易链接: https://sepolia.etherscan.io/tx/$TX_HASH"
else
  echo "✗ API 响应异常:"
  echo "$RESPONSE"
fi
