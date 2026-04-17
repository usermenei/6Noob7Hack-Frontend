'use client'
import Image from 'next/image'
import InteractiveCard from './InteractiveCard'
import Rating from '@mui/material/Rating'

export default function Card({ venueName, imgSrc, ratingValue, onRatingChange }: {
    venueName: string,
    imgSrc: string,
    ratingValue?: number,
    onRatingChange?: (venue: string, rating: number) => void,
}) {
    return (
        <InteractiveCard contentName={venueName}>
            <div className='w-full h-[60%] relative rounded-t-lg'>
                <Image src={imgSrc}
                    alt='Workspace Picture'
                    fill={true}
                    className='object-cover rounded-t-lg'
                />
            </div>
            <div className='w-full p-[10px]'>{venueName}</div>
            {
                onRatingChange ?
                <div className='w-full px-[10px] pb-[10px]' onClick={(e) => e.stopPropagation()}>
                    <Rating
                        id={`${venueName} Rating`}
                        name={`${venueName} Rating`}
                        data-testid={`${venueName} Rating`}
                        value={ratingValue ?? 0}
                        onChange={(event, newValue) => {
                            event.stopPropagation()
                            onRatingChange?.(venueName, newValue ?? 0)
                        }}
                    />
                </div> : ''
            }
        </InteractiveCard>
    )
}