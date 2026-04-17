'use client'
import { useReducer } from 'react'
import Card from './Card'

const venues = [
  { vid: '001', venueName: 'The Bloom Pavilion', imgSrc: '/img/bloom.jpg' },
  { vid: '002', venueName: 'Spark Space',        imgSrc: '/img/sparkspace.jpg' },
  { vid: '003', venueName: 'The Grand Table',    imgSrc: '/img/grandtable.jpg' },
]

export default function CardPanel() {

  const ratingReducer = (ratingMap: Map<string, number>, action: { type: string, venueName: string, rating?: number }) => {
    switch (action.type) {
      case 'init': {
        if (ratingMap.has(action.venueName)) return ratingMap
        const newMap = new Map(ratingMap)
        newMap.set(action.venueName, 0)
        return newMap
      }
      case 'update': {
        const newMap = new Map(ratingMap)
        newMap.set(action.venueName, action.rating ?? 0)
        return newMap
      }
      case 'remove': {
        const newMap = new Map(ratingMap)
        newMap.delete(action.venueName)
        return newMap
      }
      default: return ratingMap
    }
  }

  const [ratingMap, dispatchRating] = useReducer(ratingReducer, (() => {
    const m = new Map<string, number>()
    venues.forEach(v => m.set(v.venueName, 0))
    return m
  })())

  return (
    <div>
      <div style={{ margin: '20px', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', alignContent: 'space-around' }}>
        {venues.map((v) => (
          <Card
            key={v.venueName}
            venueName={v.venueName}
            imgSrc={v.imgSrc}
            ratingValue={ratingMap.get(v.venueName) ?? 0}
            onRatingChange={(venue, rating) =>
              dispatchRating({ type: 'update', venueName: venue, rating })
            }
          />
        ))}
      </div>

      <div className='w-full text-xl font-medium p-4'>
        Venue List with Ratings : {ratingMap.size}
      </div>
      {Array.from(ratingMap.entries()).map(([venue, rating]) => (
        <div
          key={venue}
          data-testid={venue}
          onClick={() => dispatchRating({ type: 'remove', venueName: venue })}
          style={{ cursor: 'pointer', padding: '4px 16px' }}
        >
          {venue} : {rating}
        </div>
      ))}
    </div>
  )
}