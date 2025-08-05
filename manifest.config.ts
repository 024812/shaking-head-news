export default {
  manifest_version: 3,
  name: '歪脖子新闻标签页',
  description: '一款集成每日新闻且可以预防颈椎病的新标签页扩展',
  version: process.env.npm_package_version,
  author: '024812 <024812@users.noreply.github.com>',
  homepage_url: 'https://github.com/024812/wai-news',
  chrome_url_overrides: {
    newtab: 'index.html',
  },
  icons: {
    '16': 'icons/logo16.png',
    '32': 'icons/logo32.png',
    '48': 'icons/logo48.png',
    '64': 'icons/logo64.png',
    '128': 'icons/logo128.png',
  },
  permissions: ['storage'],
  browser_specific_settings: {
    gecko: {
      id: '{8ff02995-1ecd-4d77-9b1c-f4994f9ae70g}',
    },
  },
}
