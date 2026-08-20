import React from "react";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`[ErrorBoundary - ${this.props.name || "Component"}]`, error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 text-red-300 font-sans text-xs flex flex-col items-center justify-center space-y-3 h-full min-h-[120px] text-center">
          <div className="p-2.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
            <FiAlertTriangle className="text-base" />
          </div>
          <div>
            <div className="font-semibold text-white text-xs">
              {this.props.name || "Component"} Error
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5 max-w-xs truncate">
              {this.state.error?.message || "An unexpected error occurred in this view."}
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 font-medium text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <FiRefreshCw className="text-xs" />
            <span>Reset Component</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
