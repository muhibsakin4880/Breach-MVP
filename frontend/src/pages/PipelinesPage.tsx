import { useState } from 'react'
import PipelinesApiTab from '../components/pipelines/PipelinesApiTab'
import PipelinesHero from '../components/pipelines/PipelinesHero'
import PipelinesOverviewTab from '../components/pipelines/PipelinesOverviewTab'
import PipelinesPoliciesTab from '../components/pipelines/PipelinesPoliciesTab'
import PipelinesResourcesTab from '../components/pipelines/PipelinesResourcesTab'
import PipelinesTabNav from '../components/pipelines/PipelinesTabNav'
import type { PipelinesTab } from '../components/pipelines/pipelinesContent'

export default function PipelinesPage() {
    const [activeTab, setActiveTab] = useState<PipelinesTab>('overview')
    const [copiedItem, setCopiedItem] = useState<string | null>(null)

    const handleCopy = async (id: string, value: string) => {
        try {
            await navigator.clipboard.writeText(value)
            setCopiedItem(id)
            window.setTimeout(() => {
                setCopiedItem(current => (current === id ? null : current))
            }, 1800)
        } catch {
            setCopiedItem(null)
        }
    }

    return (
        <div className="cyber-grid-bg min-h-screen">
            <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 text-white">
                <PipelinesHero activeTab={activeTab} />
                <PipelinesTabNav activeTab={activeTab} onChange={setActiveTab} />

                {activeTab === 'overview' && (
                    <PipelinesOverviewTab copiedItem={copiedItem} onCopy={handleCopy} />
                )}
                {activeTab === 'api' && (
                    <PipelinesApiTab copiedItem={copiedItem} onCopy={handleCopy} />
                )}
                {activeTab === 'resources' && (
                    <PipelinesResourcesTab copiedItem={copiedItem} onCopy={handleCopy} />
                )}
                {activeTab === 'policies' && <PipelinesPoliciesTab />}
            </div>
        </div>
    )
}
