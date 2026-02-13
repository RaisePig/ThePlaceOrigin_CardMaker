/**
 * 应用配置（从 public/app-config.json 读取，后台可通过替换该文件控制开关）
 */
export interface AppConfig {
  watermarkEnabled: boolean
}

let cached: AppConfig | null = null

const DEFAULT_CONFIG: AppConfig = {
  watermarkEnabled: false
}

/**
 * 获取应用配置。从 /app-config.json 读取，失败则使用默认（水印关闭）
 * 后台通过替换 public/app-config.json 或部署目录下的该文件即可控制水印开关
 */
export async function getAppConfig(): Promise<AppConfig> {
  if (cached) return cached
  try {
    const res = await fetch('/app-config.json', { cache: 'no-store' })
    if (res.ok) {
      const json = await res.json()
      cached = { ...DEFAULT_CONFIG, ...json }
      return cached!
    }
  } catch (_) {
    // 忽略错误，使用默认配置
  }
  cached = DEFAULT_CONFIG
  return cached
}

/**
 * 清除缓存，下次调用 getAppConfig 会重新请求
 */
export function clearAppConfigCache(): void {
  cached = null
}
