'use client';

import { Component, type ReactNode } from 'react';

interface MapErrorBoundaryProps {
  children: ReactNode;
}

interface MapErrorBoundaryState {
  attempt: number;
  failed: boolean;
}

const MAX_AUTOMATIC_RETRIES = 2;

export class MapErrorBoundary extends Component<MapErrorBoundaryProps, MapErrorBoundaryState> {
  state: MapErrorBoundaryState = { attempt: 0, failed: false };

  static getDerivedStateFromError(): Partial<MapErrorBoundaryState> {
    return { failed: true };
  }

  componentDidUpdate(): void {
    if (this.state.failed && this.state.attempt < MAX_AUTOMATIC_RETRIES) {
      this.retry();
    }
  }

  private retry = (): void => {
    this.setState((current) => ({ attempt: current.attempt + 1, failed: false }));
  };

  render(): ReactNode {
    if (this.state.failed && this.state.attempt >= MAX_AUTOMATIC_RETRIES) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#0f172a] p-6 text-center text-sm text-slate-400">
          <p>No pudimos cargar el mapa.</p>
          <button
            type="button"
            onClick={this.retry}
            className="rounded-xl border border-[#f59e0b]/40 px-4 py-2 font-semibold text-[#f9c784] transition hover:bg-[#f59e0b]/10"
          >
            Reintentar
          </button>
        </div>
      );
    }
    if (this.state.failed) return null;
    return <div key={this.state.attempt} className="h-full w-full">{this.props.children}</div>;
  }
}
