'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'
import type CrowdMap from './CrowdMap'

const CrowdMapClient = dynamic(() => import('./CrowdMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#1a1a1a] rounded-lg flex items-center justify-center">
      <p className="text-[#555] text-sm">Loading map…</p>
    </div>
  ),
})

type Props = ComponentProps<typeof CrowdMap>

export default function DynamicMap(props: Props) {
  return <CrowdMapClient {...props} />
}
