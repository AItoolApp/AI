# 识图工具（vision.js）

给无原生识图能力的模型补充"看图"能力：图片 → 视觉模型 API → 文字描述。

## 配置

环境变量（或 .env 文件）：
```
DASHSCOPE_API_KEY=你的key
DASHSCOPE_BASE_URL=https://open.bigmodel.cn/api/paas/v4   # 智谱
VISION_MODEL=glm-4.6v
```

当前使用智谱 glm-4.6v（免费 600 万 tokens，约可看 3000-4000 张图）。

## 用法

```bash
node tools/vision.js <图片路径> "问题"
node tools/vision.js --url <图片链接> "问题"
```

## 来源

https://github.com/asuojun/claude-vision-skill
