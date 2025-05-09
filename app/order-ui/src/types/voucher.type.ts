import { IBase } from './base.type'

export interface IVoucher extends IBase {
  title: string
  description?: string
  code: string
  value: number
  maxUsage: number
  isActive: boolean
  minOrderValue: number
  remainingUsage: number
  startDate: string
  endDate: string
  isVerificationIdentity?: boolean
}

export interface IGetAllVoucherRequest {
  minOrderValue?: number
  date?: string
  isActive?: boolean
}

export interface ICreateVoucherRequest {
  title: string
  description?: string
  code: string
  value: number
  maxUsage: number
  minOrderValue: number
  isActive: boolean
  startDate: string
  endDate: string
}

export interface IUpdateVoucherRequest {
  slug: string
  title: string
  description?: string
  code: string
  value: number
  maxUsage: number
  minOrderValue: number
  isActive: boolean
  startDate: string
  endDate: string
}

export interface IValidateVoucherRequest {
  voucher: string
  user: string //user slug
}
export interface IGetSpecificVoucherRequest {
  slug?: string
  code?: string
}
