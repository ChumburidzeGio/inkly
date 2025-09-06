export type Alignment = 'top' | 'center' | 'bottom'
export type ImageForm = 'circle' | 'square' | 'rectangle'
export type BorderStyle = 'solid' | 'dashed' | 'dotted'
// Deprecated: previously used; kept for backward compat in case imports exist
export type ShadowSize = 'sm' | 'md' | 'lg'
export type FontFamily = 'inter' | 'sf' | 'roboto' | 'arial'
export type FontWeight = '400' | '500' | '600' | '700'

export type SocialMedia = 'twitter' | 'instagram' | 'github' | 'linkedin' | 'portfolio'

export type Social = {
  title: string
  url: string
  type: SocialMedia
}

export interface SignatureOptions {
  gap: {
    title: number
    subtitle: number
    social: number
    image: number
    socialSection: number
    legalSection: number
    socialToCompany: number
  }
  size: {
    title: number
    subtitle: number
    social: number
    legalCompany: number
    legalDisclaimer: number
  }
  color: {
    title: string
    autoTitle: boolean
    subtitle: string
    social: string
    legal: string
    background: string
    transparent: boolean
  }
  image: {
    align: Alignment
    form: ImageForm
    size: number
    border: boolean
    borderStyle: BorderStyle
    borderColor: string
    borderWidth: number
    shadow: boolean
    // Use numeric intensity in UI and rendering
    shadowIntensity: number
  }
  font: {
    family: FontFamily
    titleWeight: FontWeight
  }
}

export interface SignatureFormData {
  image: string
  fullName: string
  jobTitle: string
  company: string
  phone: string
  legalCompanyLine: string
  legalDisclaimer: string
  socials: Array<{
    title: string
    url: string
  }>
}

export interface Signature {
  data: SignatureFormData
  options: SignatureOptions
}
