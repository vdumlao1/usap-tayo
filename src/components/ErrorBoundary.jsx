import { Component } from 'react';

/*
  Safety net: if a page crashes while rendering, show a friendly message
  instead of a blank screen. (Error boundaries must be class components —
  it's one of the few places React still requires them.)
  Your saved progress is untouched; it lives in localStorage.
*/
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Usap Tayo crashed:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="empty" role="alert">
        <div className="empty__emoji" aria-hidden="true">
          😵
        </div>
        <h1 className="empty__title">Ay naku! Something went wrong.</h1>
        <p className="empty__text">Your progress is safe. Try reloading the page.</p>
        <div className="empty__actions">
          <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
            Reload
          </button>
          <a className="btn btn--ghost" href="#/" onClick={() => this.setState({ error: null })}>
            Go home
          </a>
        </div>
      </div>
    );
  }
}
