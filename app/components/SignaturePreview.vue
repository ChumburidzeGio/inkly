<script setup lang="ts">
import type { Signature } from '~~/types'

const props = defineProps<Signature & { theme?: string, isMobile?: boolean }>()
const { data, options, theme = 'dark' } = props

const toast = useToast()
const signatureContainer = ref<HTMLElement>()
const copied = ref(false)

const scale = computed(() => (props.isMobile ? 1 : 0.9))
function px(n: number) {
  return `${Math.round(n * scale.value)}px`
}

async function copyToClipboard() {
  const el = signatureContainer.value
  if (!el) {
    toast.add({
      title: 'Preview not ready',
      icon: 'i-heroicons-exclamation-circle',
      color: 'red',
      timeout: 2000,
    })
    return
  }

  const html = el.innerHTML
  const text = el.innerText || el.textContent || ''

  try {
    // Prefer modern async Clipboard API with HTML payload
    if (navigator.clipboard && 'write' in navigator.clipboard) {
      const item = new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' })
      })
      // @ts-expect-error: Clipboard.write is available in supported browsers
      await navigator.clipboard.write([item])
    } else {
      throw new Error('clipboard.write not supported')
    }

    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1000)
    toast.add({
      title: 'Signature copied to clipboard!',
      description: 'Paste into your email client as rich signature.',
      icon: 'i-heroicons-clipboard-document-check',
      color: 'green',
      timeout: 2000,
    })
  } catch (err) {
    // Fallback: select DOM and execCommand('copy') to copy rich HTML
    try {
      const selection = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents(el)
      selection?.removeAllRanges()
      selection?.addRange(range)
      const ok = document.execCommand('copy')
      selection?.removeAllRanges()
      if (!ok) throw new Error('execCommand copy failed')

      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 1000)
      toast.add({
        title: 'Signature copied to clipboard!',
        description: 'Paste into your email client as rich signature.',
        icon: 'i-heroicons-clipboard-document-check',
        color: 'green',
        timeout: 2000,
      })
    } catch (fallbackErr) {
      // Last resort: copy plain text so user gets something
      try {
        await navigator.clipboard?.writeText?.(text)
        copied.value = true
        setTimeout(() => {
          copied.value = false
        }, 1000)
        toast.add({
          title: 'Copied as plain text',
          icon: 'i-heroicons-clipboard-document',
          color: 'yellow',
          timeout: 2000,
        })
      } catch {
        toast.add({
          title: 'Failed to copy',
          icon: 'i-heroicons-exclamation-circle',
          color: 'red',
          timeout: 2000,
        })
      }
    }
  }
}
</script>

<template>
  <div class="w-full">
    <div ref="signatureContainer" class="py-2">
      <ClientOnly>
        <table :style="options.color.transparent ? {} : { backgroundColor: `${options.color.background}` }" style="width: 100%;">
          <tbody>
            <tr>
              <td
                style="padding: 4px;"
                :style="[
                  { width: `${options.image.size + options.gap.image}px` },
                  options.image.align === 'top' ? { verticalAlign: 'top' } : {},
                  options.image.align === 'center' ? { verticalAlign: 'middle' } : {},
                  options.image.align === 'bottom' ? { verticalAlign: 'bottom' } : {},
                ]"
              >
                <img
                  :src="data.image"
                  alt="Profile Picture"
                  :style="[
                    options.image.form === 'rectangle' ? { width: `${options.image.size}px` } : {},
                    options.image.form === 'square' ? { width: `${options.image.size}px`, height: `${options.image.size}px` } : {},
                    options.image.form === 'circle' ? { width: `${options.image.size}px`, height: `${options.image.size}px`, borderRadius: `${options.image.size}px` } : {},
                    { objectFit: 'cover' },
                    options.image.border ? {
                      border: `${options.image.borderWidth}px ${options.image.borderStyle} ${options.image.borderColor}`,
                    } : {},
                    options.image.shadow ? {
                      boxShadow: `0 ${options.image.shadowIntensity * 2}px ${options.image.shadowIntensity * 4}px -${options.image.shadowIntensity}px rgb(0 0 0 / ${options.image.shadowIntensity * 0.05})`
                    } : {},
                  ]"
                >
              </td>
              <td
                style="padding: 4px;"
                :style="[
                  { fontSize: px(options.size.subtitle), verticalAlign: 'top' }
                ]"
                :class="[
                  options.font.family === 'inter' ? 'font-inter' :
                  options.font.family === 'sf' ? 'font-sf' :
                  options.font.family === 'roboto' ? 'font-roboto' :
                  'font-arial'
                ]"
              >
                <table :style="{ fontSize: px(options.size.subtitle), lineHeight: `${Math.round(options.size.subtitle * scale * 1.25)}px` }">
                  <tr v-if="data.fullName">
                    <td
                      :style="[
                        {
                          fontSize: px(options.size.title),
                          color: options.color.autoTitle ? '' : options.color.title,
                          fontWeight: options.font.titleWeight
                        }
                      ]"
                    >
                      {{ data.fullName }}
                    </td>
                  </tr>
                  <tr v-if="data.jobTitle || data.company">
                    <td :style="{ fontSize: px(options.size.subtitle), color: options.color.autoTitle ? '' : options.color.subtitle }">
                      <template v-if="data.jobTitle && data.company">
                        {{ data.jobTitle }}&nbsp;at&nbsp;{{ data.company }}
                      </template>
                      <template v-else-if="data.jobTitle">
                        {{ data.jobTitle }}
                      </template>
                      <template v-else>
                        {{ data.company }}
                      </template>
                    </td>
                  </tr>
                  <tr v-if="data.phone">
                    <td :style="{ color: options.color.autoTitle ? '' : options.color.subtitle }">{{ data.phone }}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Social links full width under main row -->
            <tr v-if="data.socials.length > 0">
              <td
                colspan="2"
                :style="[{ padding: '6px' }, { paddingTop: px(options.gap.socialSection) }]"
              >
                <div :style="{ fontSize: px(options.size.social), color: options.color.social }">
                  <template v-for="(social, idx) in data.socials.filter(s => s.url)" :key="social.title + idx">
                    <a :href="social.url" style="text-decoration: underline" :style="{ color: options.color.social }">{{ social.title }}</a>
                    <span
                      v-if="idx < data.socials.filter(s => s.url).length - 1"
                      :style="{ margin: `0 ${options.gap.social}px`, color: 'inherit' }"
                    >
                      ·
                    </span>
                  </template>
                </div>
              </td>
            </tr>
            <!-- Footer / Legal Disclaimer spanning full width -->
            <tr>
              <td
                colspan="2"
                :style="[{ padding: '6px' }, { paddingTop: px(options.gap.socialToCompany) }, { color: options.color.legal }]"
              >
                <div v-if="data.legalCompanyLine" :style="{ fontSize: px(options.size.legalCompany), whiteSpace: 'pre-wrap' }">
                  {{ data.legalCompanyLine }}
                </div>
                <div
                  v-if="data.legalDisclaimer"
                  :style="{ marginTop: px(options.gap.legalSection), whiteSpace: 'pre-wrap', fontSize: px(options.size.legalDisclaimer) }"
                >
                  {{ data.legalDisclaimer }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <template #fallback>
          <div class="h-24 animate-pulse bg-neutral-700 rounded-md" />
        </template>
      </ClientOnly>
    </div>

    <div class="flex justify-center mt-6">
      <UButton
        size="lg"
        color="primary"
        variant="solid"
        :icon="copied ? 'i-heroicons-clipboard-document-check' : 'i-heroicons-clipboard-document'"
        :label="copied ? 'Copied!' : 'Copy Signature'"
        @click="copyToClipboard()"
      />
    </div>
  </div>
</template>
