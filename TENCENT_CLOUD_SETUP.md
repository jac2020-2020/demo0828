# 腾讯云COS配置指南

## 🌟 功能说明

本项目已集成音乐分享功能，用户可以将生成的音乐作为链接分享给其他人。分享的音乐数据存储在腾讯云对象存储(COS)中，实现跨平台分享。

## 📋 前置准备

1. **腾讯云账号**：确保您已有腾讯云账号
2. **实名认证**：完成腾讯云实名认证
3. **开通COS服务**：在腾讯云控制台开通对象存储服务

## 🔧 配置步骤

### 1. 创建存储桶

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 搜索并进入「对象存储 COS」
3. 点击「存储桶列表」→「创建存储桶」
4. 配置存储桶：
   - **名称**：例如 `lonein-music-share`
   - **地域**：选择就近地域（如北京、上海）
   - **访问权限**：公有读私有写
   - **其他设置**：保持默认

### 2. 获取访问密钥

1. 访问 [API密钥管理](https://console.cloud.tencent.com/cam/capi)
2. 点击「新建密钥」
3. 记录以下信息：
   - **SecretId**：访问密钥ID
   - **SecretKey**：访问密钥Secret

### 3. 配置项目

编辑 `src/services/cloudStorage.ts` 文件，更新配置：

```typescript
// 初始化云存储配置（请替换为您的实际配置）
cloudStorage.init({
    secretId: 'your-actual-secret-id',     // 替换为您的SecretId
    secretKey: 'your-actual-secret-key',   // 替换为您的SecretKey
    bucket: 'your-bucket-name',            // 替换为您的存储桶名称
    region: 'ap-beijing'                   // 替换为您的存储桶地域
});
```

### 4. 安装腾讯云SDK

在项目根目录执行：

```bash
npm install cos-js-sdk-v5
```

### 5. 更新云存储服务

将 `src/services/cloudStorage.ts` 中的模拟方法替换为真实的COS调用：

```typescript
import COS from 'cos-js-sdk-v5';

class CloudStorageService {
    private config: CloudConfig | null = null;
    private cos: COS | null = null;
    
    init(config: CloudConfig) {
        this.config = config;
        this.cos = new COS({
            SecretId: config.secretId,
            SecretKey: config.secretKey,
        });
    }
    
    // 真实的上传方法
    private async uploadToCOS(shareId: string, data: SharedMusicData): Promise<{success: boolean}> {
        if (!this.cos || !this.config) {
            throw new Error('COS未初始化');
        }
        
        try {
            const result = await this.cos.putObject({
                Bucket: this.config.bucket,
                Region: this.config.region,
                Key: `shared-music/${shareId}.json`,
                Body: JSON.stringify(data),
                ContentType: 'application/json',
            });
            
            return { success: true };
        } catch (error) {
            console.error('上传到COS失败:', error);
            throw error;
        }
    }
    
    // 真实的下载方法
    private async downloadFromCOS(shareId: string): Promise<SharedMusicData | null> {
        if (!this.cos || !this.config) {
            throw new Error('COS未初始化');
        }
        
        try {
            const result = await this.cos.getObject({
                Bucket: this.config.bucket,
                Region: this.config.region,
                Key: `shared-music/${shareId}.json`,
            });
            
            const data = JSON.parse(result.Body as string);
            return data;
        } catch (error) {
            if (error.statusCode === 404) {
                return null; // 文件不存在
            }
            console.error('从COS下载失败:', error);
            throw error;
        }
    }
}
```

## 🎵 使用方式

### 分享音乐

1. **音乐播放页面**：点击右上角分享按钮
2. **聊天页面音乐卡片**：点击分享按钮
3. **礼物音乐**：点击分享按钮

### 访问分享链接

分享链接格式：`https://your-domain.com/share/music/{shareId}`

其他人点击链接后可以：
- 🎧 在线播放音乐
- 📖 查看歌词
- 🔗 复制链接继续分享
- 📱 下载应用体验完整功能

## 🔒 安全建议

1. **密钥安全**：
   - 不要将密钥提交到代码仓库
   - 使用环境变量存储敏感信息
   - 定期轮换访问密钥

2. **权限控制**：
   - 存储桶设置为「公有读私有写」
   - 考虑使用临时密钥
   - 设置合理的CORS策略

3. **成本控制**：
   - 设置存储生命周期规则
   - 监控存储使用量
   - 考虑CDN加速降低成本

## 🚀 部署建议

### 环境变量配置

创建 `.env` 文件：

```env
VITE_COS_SECRET_ID=your-secret-id
VITE_COS_SECRET_KEY=your-secret-key
VITE_COS_BUCKET=your-bucket-name
VITE_COS_REGION=ap-beijing
```

在代码中使用：

```typescript
cloudStorage.init({
    secretId: import.meta.env.VITE_COS_SECRET_ID,
    secretKey: import.meta.env.VITE_COS_SECRET_KEY,
    bucket: import.meta.env.VITE_COS_BUCKET,
    region: import.meta.env.VITE_COS_REGION
});
```

### 生产环境优化

1. **CDN加速**：为存储桶配置CDN
2. **域名绑定**：使用自定义域名
3. **HTTPS**：确保使用HTTPS协议
4. **缓存策略**：设置合理的缓存时间

## 🎯 功能特性

- ✅ 一键分享音乐
- ✅ 生成独立播放页面
- ✅ 支持歌词显示
- ✅ 无需登录即可播放
- ✅ 响应式设计
- ✅ 复制链接功能
- ✅ 应用推广引流

## 📞 技术支持

如有问题，请参考：
- [腾讯云COS文档](https://cloud.tencent.com/document/product/436)
- [COS JavaScript SDK](https://cloud.tencent.com/document/product/436/11459)
- 项目Issues页面 