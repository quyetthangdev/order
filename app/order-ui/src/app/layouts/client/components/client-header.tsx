import { NavLink } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'

import {
  DropdownClientHeader,
  SelectBranchDropdown,
  SettingsDropdown,
} from '@/components/app/dropdown'
import { useCartItemStore } from '@/stores'
import { HomelandLogo } from '@/assets/images'
import { ROUTE } from '@/constants'
import { Button } from '@/components/ui'
import { NavigationSheet } from '@/components/app/sheet'
import { useIsMobile } from '@/hooks'

export function ClientHeader() {
  const isMobile = useIsMobile()
  const { getCartItems } = useCartItemStore()
  return (
    <header className={`sticky top-0 z-30 w-full shadow-md text-muted-foreground backdrop-blur-lg`}>
      <div className="container">
        <div className="flex items-center justify-between w-full h-14">
          {/* Left content*/}
          <div className="flex items-center gap-1">
            {!isMobile && <NavigationSheet />}
            <NavLink to={ROUTE.HOME} className="flex items-center gap-2">
              {<img src={HomelandLogo} alt="logo" className="h-8 w-fit" />}
            </NavLink>
          </div>

          {/* center content */}
          <div className="flex-row items-center justify-center hidden gap-6 lg:flex">
            <NavLink
              to={ROUTE.HOME}
              className={({ isActive }) =>
                `flex items-center gap-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`
              }
            >
              <span className="text-sm">Trang chủ</span>
            </NavLink>
            <NavLink
              to={ROUTE.CLIENT_MENU}
              className={({ isActive }) =>
                `flex items-center gap-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`
              }
            >
              <span className="text-sm">Thực đơn</span>
            </NavLink>
            <NavLink
              to={ROUTE.ABOUT}
              className={({ isActive }) =>
                `flex items-center gap-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`
              }
            >
              <span className="text-sm">Về chúng tôi</span>
            </NavLink>
            <NavLink
              to={ROUTE.POLICY}
              className={({ isActive }) =>
                `flex items-center gap-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`
              }
            >
              <span className="text-sm">Điều khoản</span>
            </NavLink>
          </div>

          {/* Right content */}
          <div className="flex items-center justify-end gap-2">
            {/* Cart */}
            <NavLink
              to={ROUTE.CLIENT_CART}
              className="relative flex items-center gap-2"
            >
              <Button
                variant="ghost"
                className="relative text-muted-foreground hover:bg-primary/10 hover:text-primary"
              >
                <ShoppingCart />
                {getCartItems()?.orderItems?.length ? (
                  <span className="absolute flex items-center justify-center w-4 h-4 text-xs font-bold text-white transform translate-x-1/2 -translate-y-1/2 rounded-full right-2 top-2 bg-primary">
                    {getCartItems()?.orderItems.length}
                  </span>
                ) : null}
              </Button>
            </NavLink>

            {/* Settings */}
            <SettingsDropdown />

            {/* Select branch */}
            <SelectBranchDropdown />

            {/* Login + Profile */}
            <DropdownClientHeader />
          </div>
        </div>
      </div>
    </header>
  )
}
