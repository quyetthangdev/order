import React from "react";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { publicFileURL } from "@/constants/env";
import { IMenuItem, IProduct } from "@/types";
import { SkeletonMenuList } from '@/components/app/skeleton';
import { Com } from '@/assets/images';
import { formatCurrency } from "@/utils";
import { useTranslation } from "react-i18next";
import { Badge, Button } from "@/components/ui";
import { useIsMobile } from "@/hooks";
import { ClientAddToCartDrawer } from "@/components/app/drawer";
import { ClientAddToCartDialog } from "@/components/app/dialog";
import { NavLink } from "react-router-dom";
import { ROUTE } from "@/constants";
import NewTagImage from "@/assets/images/new-product-icon.png";
interface ISliderMenuPromotionProps {
    menus: IMenuItem[] | undefined
    isFetching: boolean
    type?: string
}

export default function SliderMenu({ menus, isFetching, type }: ISliderMenuPromotionProps): React.ReactElement {
    const { t } = useTranslation('menu')
    const isMobile = useIsMobile()
    const getPriceRange = (variants: IProduct['variants']) => {
        if (!variants || variants.length === 0) return null

        const prices = variants.map((v) => v.price)
        const minPrice = Math.min(...prices)
        const maxPrice = Math.max(...prices)

        return {
            min: minPrice,
            max: maxPrice,
            isSinglePrice: minPrice === maxPrice,
        }
    }
    const breakpoints = {
        320: { slidesPerView: 2, spaceBetween: 10, },
        560: { slidesPerView: 2, spaceBetween: 30, },
        768: { slidesPerView: 3, spaceBetween: 30, },
        1024: { slidesPerView: 4, spaceBetween: 20, },
        1280: { slidesPerView: 5, spaceBetween: 15, },
    }
    return (
        <Swiper
            breakpoints={breakpoints}
            initialSlide={0}
            modules={[Autoplay, Pagination]}
            className="overflow-y-visible w-full h-full mySwiper"
        >
            {!isFetching ? menus?.map((item, index) => {
                const imageProduct = item?.product?.image ? publicFileURL + "/" + item.product.image : Com
                return (
                    <SwiperSlide key={index} className="py-2 w-full h-full">
                        <div className="flex h-full w-full flex-col rounded-xl border shadow-sm bg-white dark:bg-transparent backdrop-blur-md transition-all duration-300 hover:scale-[1.03] ease-in-out">
                            <NavLink to={`${ROUTE.CLIENT_MENU_ITEM}?slug=${item.slug}`}>
                                <>
                                    <img src={imageProduct} alt="product" className="object-cover w-full h-36 rounded-t-md" />
                                    {item.product.isNew &&
                                        <div className="absolute -top-[3px] -right-[3px] z-50 w-[3.5rem]">
                                            <img src={NewTagImage} alt="promotion-tag" className="w-full" />
                                        </div>}
                                </>

                                <div className="flex flex-1 flex-col justify-between space-y-1.5 p-2">
                                    <div>
                                        <h3 className="text-lg font-bold line-clamp-1">{item.product.name}</h3>
                                        <p className="text-[12px] text-gray-500 dark:text-gray-300 break-words line-clamp-2 text-ellipsis overflow-hidden min-h-[36px]">
                                            {item?.product?.description || "Hương vị đặc biệt"}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between gap-1 h-[82px]">
                                        <div className="flex flex-col">
                                            {item.product.variants.length > 0 ? (
                                                <div className="flex flex-col gap-1 justify-start items-start">
                                                    <div className='flex flex-row gap-1 items-center'>
                                                        {item.promotion && item?.promotion?.value > 0 ? (
                                                            <div className='flex flex-col gap-1 justify-start items-start mt-2'>
                                                                <span className="text-sm sm:text-lg text-primary">
                                                                    {(() => {
                                                                        const range = getPriceRange(item.product.variants)
                                                                        if (!range) return formatCurrency(0)
                                                                        return range.isSinglePrice
                                                                            ? `${formatCurrency((range.min) * (1 - item?.promotion?.value / 100))}` : `${formatCurrency(range.min * (1 - item?.promotion?.value / 100))}`
                                                                    })()}
                                                                </span>
                                                                <div className='flex flex-row gap-3 items-center'>
                                                                    <span className="text-sm line-through text-muted-foreground/70">
                                                                        {(() => {
                                                                            const range = getPriceRange(item.product.variants)
                                                                            if (!range) return formatCurrency(0)
                                                                            return range.isSinglePrice
                                                                                ? `${formatCurrency((range.min))}` : `${formatCurrency(range.min)}`
                                                                        })()}
                                                                    </span>
                                                                    {item?.promotion?.value > 0 && (
                                                                        <Badge className="text-[10px] sm:text-xs bg-destructive hover:bg-destructive">
                                                                            {t('menu.discount')} {item?.promotion?.value}%
                                                                        </Badge>
                                                                    )}
                                                                </div>

                                                            </div>) : (
                                                            <span className="text-sm font-bold sm:text-lg text-primary">
                                                                {(() => {
                                                                    const range = getPriceRange(item.product.variants)
                                                                    if (!range) return formatCurrency(0)
                                                                    return range.isSinglePrice
                                                                        ? `${formatCurrency(range.min)}`
                                                                        : `${formatCurrency(range.min)}`
                                                                })()}
                                                            </span>
                                                        )}

                                                    </div>
                                                    {item?.product?.isLimit &&
                                                        <span className="text-[0.7rem] text-muted-foreground">
                                                            {t('menu.amount')}
                                                            {item.currentStock}/{item.defaultStock}
                                                        </span>}
                                                </div>
                                            ) : (
                                                <span className="text-sm font-bold text-primary">
                                                    {t('menu.contactForPrice')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </NavLink>
                            {item.currentStock > 0 || !item?.product?.isLimit ? (
                                <div className="flex gap-2 justify-center p-2 w-full">
                                    {isMobile ? (
                                        <ClientAddToCartDrawer product={item} />
                                    ) : (
                                        <ClientAddToCartDialog product={item} />
                                    )}
                                </div>
                            ) : (
                                <div className="flex gap-2 justify-center p-2 w-full">
                                    <Button
                                        className="flex justify-center items-center py-2 w-full text-sm font-semibold text-white bg-red-500 rounded-full"
                                        disabled
                                    >
                                        {t('menu.outOfStock')}
                                    </Button>
                                </div>
                            )}
                            {type === "best-sell" && <div className="space-y-1.5 p-2 text-[12px] text-yellow-500">{t('menu.sold')} <b>{item?.product.isTopSell ? menus[0].product.saleQuantityHistory : item?.product?.saleQuantityHistory}</b></div>}
                        </div>
                    </SwiperSlide>
                )
            }
            ) :
                [...Array(6)].map((_, index) => (
                    <SwiperSlide key={index} className="py-2 w-full h-full">
                        <SkeletonMenuList />
                    </SwiperSlide>
                ))
            }
        </Swiper >
    )
}