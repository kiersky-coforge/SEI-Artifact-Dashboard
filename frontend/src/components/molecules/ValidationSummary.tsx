import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import type { ValidationState } from '../../../../shared/types';
import { Button } from '../atoms/Button';

interface ValidationSummaryProps {
  validationState?: ValidationState;
  onRevalidate: () => void;
  isLoading?: boolean;
}

export const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  validationState,
  onRevalidate,
  isLoading = false,
}) => {
  if (!validationState) {
    return (
      <div className="p-4 rounded-lg border border-surface-border bg-surface flex items-center justify-between">
        <div className="flex items-center gap-2 text-ink-secondary text-sm">
          <AlertTriangle className="w-4 h-4 text-status-pending-text" />
          <span>Artifact has not been validated yet.</span>
        </div>
        <Button size="sm" variant="outline" onClick={onRevalidate} disabled={isLoading} icon={<RefreshCw className="w-3.5 h-3.5" />}>
          Run Validation
        </Button>
      </div>
    );
  }

  const { isValid, errors, warnings, lastValidatedAt } = validationState;

  return (
    <div className="space-y-4">
      <div
        className={`p-4 rounded-lg border flex items-center justify-between ${
          isValid
            ? 'bg-status-success/10 border-status-success/30'
            : 'bg-status-error/10 border-status-error/30'
        }`}
      >
        <div className="flex items-center gap-3">
          {isValid ? (
            <CheckCircle2 className="w-6 h-6 text-status-success-text" />
          ) : (
            <XCircle className="w-6 h-6 text-status-error-text" />
          )}
          <div>
            <h4
              className={`text-sm font-semibold ${
                isValid ? 'text-status-success-text' : 'text-status-error-text'
              }`}
            >
              {isValid ? 'Payload Validation Passed' : 'Payload Validation Failed'}
            </h4>
            <p className="text-xs text-ink-secondary mt-0.5">
              {isValid
                ? 'All prompt stages, JSON schema definitions, and example arrays conform to required syntax.'
                : `${errors.length} error(s) must be resolved before publishing.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastValidatedAt && (
            <span className="text-xs text-ink-muted">
              Checked {new Date(lastValidatedAt).toLocaleTimeString()}
            </span>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={onRevalidate}
            disabled={isLoading}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Re-validate
          </Button>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="p-4 rounded-lg border border-status-error/30 bg-status-error/5 space-y-2">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-status-error-text flex items-center gap-1.5">
            <XCircle className="w-4 h-4" /> Errors ({errors.length})
          </h5>
          <ul className="space-y-1.5">
            {errors.map((err, idx) => (
              <li key={idx} className="text-xs text-ink-primary flex items-start gap-2">
                <span className="font-mono text-status-error-text font-semibold uppercase shrink-0">
                  [{err.field}]
                </span>
                <span>{err.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="p-4 rounded-lg border border-status-warning/40 bg-status-warning/10 space-y-2">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-status-warning-text flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> Best Practice Advisories ({warnings.length})
          </h5>
          <ul className="space-y-1.5">
            {warnings.map((warn, idx) => (
              <li key={idx} className="text-xs text-ink-secondary flex items-start gap-2">
                <span className="text-status-warning-text">•</span>
                <span>{warn}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
