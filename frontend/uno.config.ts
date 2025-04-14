import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss';

export default defineConfig({
  presets: [
    presetUno(), // 基础预设
    presetAttributify(), // 属性化模式
    presetIcons(), // 图标支持
  ],
});