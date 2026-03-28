import React, { type ErrorInfo, type ReactNode } from 'react'

type RouteErrorBoundaryProps = {
    children: ReactNode
}

type RouteErrorBoundaryState = {
    hasError: boolean
}

class RouteErrorBoundary extends React.Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
    constructor(props: RouteErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(_: Error): RouteErrorBoundaryState {
        return { hasError: true }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error caught in RouteErrorBoundary:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return <h1>Invalid Route Parameters. Please try again.</h1>
        }

        return this.props.children
    }
}

export default RouteErrorBoundary
