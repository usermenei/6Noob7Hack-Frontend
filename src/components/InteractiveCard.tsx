'use client'

import { useRouter } from 'next/navigation'

export default function InteractiveCard({
  children,
  contentName
}: {
  children: React.ReactNode,
  contentName: string
}) {

  const router = useRouter()

  function onCardMouseAction(event: React.SyntheticEvent) {
    if (event.type == 'mouseover') {
      event.currentTarget.classList.remove('shadow-lg', 'bg-white')
      event.currentTarget.classList.add('shadow-2xl', 'bg-neutral-200')
    } else {
      event.currentTarget.classList.remove('shadow-2xl', 'bg-neutral-200')
      event.currentTarget.classList.add('shadow-lg', 'bg-white')
    }
  }

  function handleClick() {
    // 🔥 ส่งชื่อไป booking
    router.push(`/booking?space=${encodeURIComponent(contentName)}`)
  }

  return (
    <div
      className='w-[300px] h-[300px] rounded-lg shadow-lg bg-white cursor-pointer'
      onMouseOver={onCardMouseAction}
      onMouseOut={onCardMouseAction}
      onClick={handleClick} // ✅ เพิ่มตรงนี้
    >
      {children}
    </div>
  )
}