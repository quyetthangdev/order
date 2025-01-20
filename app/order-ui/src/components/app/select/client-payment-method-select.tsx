import { CircleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { PaymentMethodRadioGroup } from '@/components/app/radio'
import { Label } from '@/components/ui'
import { formatCurrency } from '@/utils'

interface PaymentMethodSelectProps {
  isExpired?: boolean
  timeRemaining?: number
  qrCode?: string
  total?: number
  onSubmit?: (paymentMethod: string) => void
}

export default function ClientPaymentMethodSelect({
  isExpired,
  timeRemaining,
  qrCode,
  total,
  onSubmit,
}: PaymentMethodSelectProps) {
  const { t } = useTranslation('menu')

  // Format remaining time
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePaymentMethodSubmit = (paymentMethod: string) => {
    if (onSubmit) {
      onSubmit(paymentMethod)
    }
  }

  return (
    <div className="flex flex-col w-full gap-2 mt-6 border rounded-md bg-background">
      <div className="flex flex-col gap-1 p-4 bg-muted">
        <Label className="text-md">{t('paymentMethod.title')}</Label>
        <span className='text-xs text-muted-foreground'>
          ({t('paymentMethod.cashMethodNote')})
        </span>
      </div>
      <div
        className={`grid ${qrCode ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}
      >
        <div className="flex flex-col col-span-1">
          <div className="p-4">
            <PaymentMethodRadioGroup onSubmit={handlePaymentMethodSubmit} />
          </div>
          <div className="flex items-center gap-1 px-4 pb-4 text-[0.5rem] text-muted-foreground">
            <CircleAlert size={12} className="text-blue-500" />
            {t('paymentMethod.bankTransferProcessing')}
          </div>
        </div>
        {qrCode && (
          <div className="col-span-1 pb-4">
            <div className="flex flex-col items-center justify-center">
              <img src={qrCode} alt="QR Code" className="w-2/5" />
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="text-sm">
                  {t('paymentMethod.total')}
                  <span className="text-lg font-bold">
                    {formatCurrency(total || 0)}
                  </span>
                </div>
                <div className="flex items-center gap-1 px-4 text-xs text-muted-foreground">
                  <CircleAlert size={12} className="text-blue-500" />
                  {t('paymentMethod.paymentNote')}
                </div>
                {/* Add countdown timer display */}
                <div className="mt-2 text-center">
                  {!isExpired ? (
                    <div className="text-lg font-semibold text-primary">
                      {t('paymentMethod.timeRemaining')}: {formatTime(timeRemaining || 0)}
                    </div>
                  ) : (
                    <div className="text-lg font-semibold text-destructive">
                      {t('paymentMethod.timeExpired')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
