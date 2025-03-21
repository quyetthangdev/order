import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Input } from '@/components/ui'

export default function SearchBar() {
  const { t } = useTranslation('common')
  return (
    <div className="relative w-full lg:w-96 lg:min-w-40 lg:max-w-80">
      <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
      <Input type="search" placeholder={t('common.search')} className="pl-10" />
    </div>
  )
}
