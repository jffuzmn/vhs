import { useState } from 'react'
import type { ReactNode } from 'react'
import { Frame } from '@react95/core'

interface TabProps {
  label: string
  children: ReactNode
}

interface TabsProps {
  children: React.ReactElement<TabProps> | React.ReactElement<TabProps>[]
  defaultTab?: number
}

export const Tab = ({ children }: TabProps) => {
  return <>{children}</>
}

export const Tabs = ({ children, defaultTab = 0 }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const tabs = Array.isArray(children) ? children : [children]

  return (
    <div className="win95-tabs-container">
      <div className="win95-tabs-header">
        {tabs.map((child, index) => (
          <button
            key={index}
            className={`win95-tab ${activeTab === index ? 'win95-tab-active' : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {child.props.label}
          </button>
        ))}
      </div>
      
      <Frame boxShadow="in" className="win95-tab-content">
        {tabs[activeTab]}
      </Frame>
    </div>
  )
}