import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class FeatureErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error("[douyin-keyword-crawl] runtime error:", error, info);
  }

  override render(): ReactNode {
    if (this.state.error !== null) {
      return (
        <div className="mx-auto max-w-3xl p-6">
          <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-800">
            <p className="mb-2 font-semibold">爆款素材渲染失败</p>
            <p className="mb-2">{this.state.error.message}</p>
            {this.state.error.stack !== undefined ? (
              <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-all text-xs text-red-700">
                {this.state.error.stack}
              </pre>
            ) : null}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
