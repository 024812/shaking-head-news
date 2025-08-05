export default {
  manifest_version: 3,
  name: '摇头看新闻',
  description: '一边摇头一边看新闻，颈椎健康新标签页扩展',
  version: process.env.npm_package_version,
  author: '024812 <024812@users.noreply.github.com>',
  homepage_url: 'https://github.com/024812/shaking-head-news',
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
      id: '{a1b2c3d4-e5f6-7890-abcd-ef1234567890}',
    },
  },
}
