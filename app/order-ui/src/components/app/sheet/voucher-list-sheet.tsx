import { useEffect, useState } from 'react'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { ChevronRight, CircleHelp, Copy, Ticket, TicketPercent } from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Button,
  ScrollArea,
  Input,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Label,
  SheetFooter,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Progress,
} from '@/components/ui'
import VoucherNotValid from '@/assets/images/chua-thoa-dieu-kien.svg'
import { useIsMobile, useUpdateOrderType, useValidateVoucher, useVouchers } from '@/hooks'
import { formatCurrency, showErrorToast, showToast } from '@/utils'
import { IOrder, IUpdateOrderTypeRequest, IValidateVoucherRequest, IVoucher } from '@/types'
import { useCartItemStore, useThemeStore, useUserStore } from '@/stores'
import { useQueryClient } from '@tanstack/react-query'

interface IVoucherListSheetProps {
  defaultValue?: IOrder | undefined
  onSuccess?: () => void
}

export default function VoucherListSheet({ defaultValue, onSuccess }: IVoucherListSheetProps) {
  const isMobile = useIsMobile()
  const { getTheme } = useThemeStore()
  const { t } = useTranslation(['voucher'])
  const { t: tToast } = useTranslation('toast')
  const { userInfo } = useUserStore()
  const { cartItems, addVoucher, removeVoucher } = useCartItemStore()
  const { mutate: validateVoucher } = useValidateVoucher()
  const { mutate: updateOrderType } = useUpdateOrderType()
  const [sheetOpen, setSheetOpen] = useState(false)
  const queryClient = useQueryClient();
  const { data: voucherList } = useVouchers({
    isActive: true,
    // minOrderValue: cartItems?.orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0
  })
  const [selectedVoucher, setSelectedVoucher] = useState<string | undefined>(defaultValue?.voucher?.slug)

  const voucherListData = voucherList?.result || []
  useEffect(() => {
    if (defaultValue?.voucher?.slug) {
      setSelectedVoucher(defaultValue.voucher.slug);
    } else {
      setSelectedVoucher(undefined);
    }
  }, [defaultValue?.voucher?.slug, sheetOpen]);


  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    showToast(tToast('toast.copyCodeSuccess'))
  }

  // Filter and sort vouchers to get the best one
  const getBestVoucher = () => {
    const currentDate = new Date();

    const validVouchers = voucherListData
      .filter(voucher =>
        voucher.isActive &&
        moment(voucher.startDate).format('DD/MM/YYYY') <= currentDate.toLocaleString() &&
        moment(voucher.endDate).format('DD/MM/YYYY') >= currentDate.toLocaleString() &&
        voucher.remainingUsage > 0
      )
      .sort((a, b) => {
        // Sort by endDate
        const endDateDiff = new Date(a.endDate).getTime() - new Date(b.endDate).getTime();

        if (endDateDiff !== 0) return endDateDiff;

        // If endDate is the same, sort by minOrderValue
        if (a.minOrderValue !== b.minOrderValue) {
          return a.minOrderValue - b.minOrderValue;
        }

        // If minOrderValue is the same, sort by value
        return b.value - a.value;
      });

    return validVouchers.length > 0 ? validVouchers[0] : null;
  };

  const bestVoucher = getBestVoucher();

  const isVoucherSelected = (voucherSlug: string) => {
    return cartItems?.voucher?.slug === voucherSlug || selectedVoucher === voucherSlug
  }
  const subTotal = defaultValue ? defaultValue?.subtotal : cartItems?.orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0

  const handleToggleVoucher = (voucher: IVoucher) => {
    if (defaultValue) {
      let params: IUpdateOrderTypeRequest | null = null
      let message: string;
      if (isVoucherSelected(voucher.slug)) {
        params = { type: defaultValue?.type, table: defaultValue?.table?.slug || null, voucher: null }
        message = tToast('toast.removeVoucherSuccess')
      } else {
        params = { type: defaultValue?.type, table: defaultValue?.table?.slug || null, voucher: voucher.slug }
        message = tToast('toast.applyVoucherSuccess')
      }
      updateOrderType({ slug: defaultValue.slug as string, params }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['orders'] })
          setSheetOpen(false)
          onSuccess?.()
          showToast(message)
        }
      })
    }
    else {
      if (isVoucherSelected(voucher.slug)) {
        removeVoucher()
        setSelectedVoucher(undefined)
        showToast(tToast('toast.removeVoucherSuccess'))
      } else {
        const validateVoucherParam: IValidateVoucherRequest = {
          voucher: voucher.slug,
          user: userInfo?.slug || '',
        }
        validateVoucher(validateVoucherParam, {
          onSuccess: () => {
            addVoucher(voucher)
            setSelectedVoucher(voucher.slug)
            setSheetOpen(false)
            showToast(tToast('toast.applyVoucherSuccess'))
          }
        })
      }
    }

  }

  const handleApplyVoucher = () => {
    if (selectedVoucher) {
      const voucher = voucherListData.find(voucher => voucher.code === selectedVoucher)
      if (voucher && isVoucherValid(voucher)) {
        handleToggleVoucher(voucher)
      } else {
        if (!voucher) {
          showErrorToast(1000)
        } else if (voucher.minOrderValue > subTotal) {
          showErrorToast(1001)
        } else {
          showErrorToast(1002)
        }
      }
    }
  }

  const isVoucherValid = (voucher: IVoucher) => {
    const isValidAmount = voucher.minOrderValue <= subTotal;
    const isValidDate = moment().isBefore(moment(voucher.endDate));
    return isValidAmount && isValidDate;
  }

  const renderVoucherCard = (voucher: IVoucher, isBest: boolean) => {
    const usagePercentage = (voucher.remainingUsage / voucher.maxUsage) * 100;
    const baseCardClass = `grid h-32 grid-cols-7 gap-2 p-2 rounded-md sm:h-36 relative ${isVoucherSelected(voucher.slug)
      ? `bg-${getTheme() === 'light' ? 'primary/10' : 'black'} border-primary`
      : `${getTheme() === 'light' ? 'bg-white' : ' border'}`
      } border`;

    return (
      <div className={baseCardClass} key={voucher.slug}>
        {isBest && (
          <div className="absolute -top-0 -left-0 px-2 py-1 text-xs text-white rounded-tl-md rounded-br-md bg-primary">
            {t('voucher.bestChoice')}
          </div>
        )}
        <div className={`flex items-center justify-center w-full col-span-2 rounded-md ${isVoucherSelected(voucher.slug) ? `bg-${getTheme() === 'light' ? 'white' : 'black'}` : 'bg-muted-foreground/10'}`}>
          <Ticket size={56} className='text-primary' />
        </div>
        <div className='flex flex-col col-span-3 justify-between w-full'>
          <div className='flex flex-col gap-1'>
            <span className='text-xs sm:text-sm text-muted-foreground'>
              {voucher.title}
            </span>
            <span className='text-xs italic text-primary'>
              {t('voucher.discountValue')}{voucher.value}% {t('voucher.orderValue')}
            </span>
            <span className='flex gap-1 items-center text-sm text-muted-foreground'>
              {voucher.code}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6"
                      onClick={() => handleCopyCode(voucher?.code)}
                    >
                      <Copy className="w-4 h-4 text-primary" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {t('voucher.copyCode')}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
            <span className='hidden sm:text-xs text-muted-foreground/60'>Cho đơn hàng từ {formatCurrency(voucher.minOrderValue)}</span>
          </div>
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {voucher.remainingUsage === 0
                  ? t('voucher.outOfStock')
                  : `${t('voucher.remainingUsage')}: ${voucher.remainingUsage}/${voucher.maxUsage}`
                }
              </span>
            </div>
            {voucher.remainingUsage > 0 && (
              <Progress value={usagePercentage} className="h-1" />
            )}
          </div>
          <span className='text-xs text-muted-foreground'>
            HSD: {moment(voucher.endDate).format('DD/MM/YYYY')}
          </span>
        </div>
        <div className='flex flex-col col-span-2 justify-between items-end'>
          {!isMobile ? (
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" className='p-2 h-8 text-muted-foreground'>
                    <CircleHelp />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className={`w-[18rem] p-4 bg-${getTheme() === 'light' ? 'white' : 'black'} rounded-md shadow-md text-muted-foreground`}>
                  <div className="flex flex-col gap-4 justify-between">
                    <div className="grid grid-cols-5">
                      <span className="col-span-2 text-muted-foreground/70">Mã</span>
                      <span className="flex col-span-3 gap-1 items-center">{voucher.code}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-4 h-4"
                          onClick={() => handleCopyCode(voucher?.code)}
                        >
                          <Copy className="w-4 h-4 text-primary" />
                        </Button>
                      </span>
                    </div>
                    <div className="grid grid-cols-5">
                      <span className="col-span-2 text-muted-foreground/70">Hạn sử dụng</span>
                      <span className="col-span-3">{moment(voucher.endDate).format('DD/MM/YYYY')}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className='text-muted-foreground/70'>Điều kiện</span>
                      <ul className="col-span-3 pl-4 list-disc">
                        <li>Áp dụng cho đơn hàng từ {formatCurrency(voucher.minOrderValue)}</li>
                      </ul>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className='p-2 h-8 text-muted-foreground'>
                  <CircleHelp />
                </Button>
              </PopoverTrigger>
              <PopoverContent className={`w-[20rem] mr-2 p-4 bg-${getTheme() === 'light' ? 'white' : 'black'} rounded-md shadow-md text-muted-foreground`}>
                <div className="flex flex-col gap-4 justify-between">
                  <div className="grid grid-cols-5">
                    <span className="col-span-2 text-muted-foreground/70">Mã</span>
                    <span className="flex col-span-3 gap-1 items-center">{voucher.code}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-4 h-4"
                        onClick={() => handleCopyCode(voucher?.code)}
                      >
                        <Copy className="w-4 h-4 text-primary" />
                      </Button>
                    </span>
                  </div>
                  <div className="grid grid-cols-5">
                    <span className="col-span-2 text-muted-foreground/70">Hạn sử dụng</span>
                    <span className="col-span-3">{moment(voucher.endDate).format('DD/MM/YYYY')}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className='text-muted-foreground/70'>Điều kiện</span>
                    <ul className="col-span-3 pl-4 list-disc">
                      <li>Áp dụng cho đơn hàng từ {formatCurrency(voucher.minOrderValue)}</li>
                    </ul>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
          {isVoucherValid(voucher) ? (
            <Button
              onClick={() => handleToggleVoucher(voucher)}
              variant={isVoucherSelected(voucher.slug) ? "destructive" : "default"}
            >
              {isVoucherSelected(voucher.slug) ? t('voucher.remove') : t('voucher.use')}
            </Button>
          ) : (
            <div className="flex flex-col gap-1 items-end">
              <img src={VoucherNotValid} alt="chua-thoa-dieu-kien" className="w-1/2" />
              <span className="text-xs text-destructive">
                {voucher.minOrderValue > subTotal
                  ? t('voucher.minOrderNotMet')
                  : t('voucher.expired')}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button variant='ghost' className='px-0 w-full hover:bg-primary/5'>
          <div className='flex gap-1 justify-between items-center p-2 w-full rounded-md cursor-pointer hover:bg-primary/10'>
            <div className='flex gap-1 items-center'>
              <TicketPercent className='icon text-primary' />
              <span className='text-xs text-muted-foreground'>
                {t('voucher.useVoucher')}
              </span>
            </div>
            <div>
              <ChevronRight className='icon text-muted-foreground' />
            </div>
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent className='sm:max-w-xl'>
        <SheetHeader className='p-4'>
          <SheetTitle className='text-primary'>
            {t('voucher.list')}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full bg-transparent backdrop-blur-md">
          <ScrollArea className={`max-h-[calc(100vh-8rem)] flex-1 gap-4 p-4 bg-${getTheme() === 'light' ? 'white' : 'black'}`}>
            {/* Voucher search */}
            <div className="flex flex-col flex-1">
              <div className='grid grid-cols-5 gap-2 items-center'>
                <div className="relative col-span-4 p-1">
                  <TicketPercent className="absolute left-2 top-1/2 text-gray-400 -translate-y-1/2" />
                  <Input
                    placeholder={t('voucher.enterVoucher')}
                    className="pl-10"
                    onChange={(e) => setSelectedVoucher(e.target.value)}
                    value={selectedVoucher || ''}
                  />
                </div>
                <Button className='col-span-1'
                  disabled={!selectedVoucher}
                  onClick={handleApplyVoucher}
                >
                  {t('voucher.apply')}
                </Button>
              </div>
            </div>
            {/* Voucher list */}
            <div>
              <div className='flex justify-between items-center py-4'>
                <Label className='text-md text-muted-foreground'>
                  {t('voucher.list')}
                </Label>
                <span className='text-xs text-muted-foreground'>
                  {t('voucher.maxApply')}: 1
                </span>
              </div>
              <div className='grid grid-cols-1 gap-4'>
                {voucherListData.length > 0 ?
                  voucherListData?.map((voucher) =>
                    renderVoucherCard(voucher, bestVoucher?.slug === voucher.slug)
                  ) : <div>{t('voucher.noVoucher')}</div>}
              </div>
            </div>
          </ScrollArea>
          <SheetFooter className="p-4">
            <Button className='w-full' onClick={() => setSheetOpen(false)}>
              {t('voucher.complete')}
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
