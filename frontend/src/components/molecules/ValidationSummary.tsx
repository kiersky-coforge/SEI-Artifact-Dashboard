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
      <div className="p-5 rounded-level3 border border-brand-navy/[0.08] dark:border-white/10 bg-white dark:bg-slate-900 shadow-level1 flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-brand-grey text-xs font-semibold uppercase tracking-wide">
          <AlertTriangle className="w-4 h-4 text-brand-coral" />
          <span>Artifact has not been validated yet.</span>
        </div>
        <Button size="sm" variant="secondary" onClick={onRevalidate} disabled={isLoading} icon={<RefreshCw className="w-3.5 h-3.5" />}>
          Run Validation
        </Button>
      </div>
    );
  }

  const { isValid, errors, warnings, lastValidatedAt } = validationState;

  return (
    <div className="space-y-4">
      <div
        className={`p-5 rounded-level4 border shadow-level1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isValid
            ? 'bg-brand-green/5 border-brand-green/20'
            : 'bg-alert-coral/5 border-alert-coral/20'
        }`}
      >
        <div className="flex items-center gap-3">
          {isValid ? (
            <CheckCircle2 className="w-6 h-6 text-brand-green flex-shrink-0" />
          ) : (
            <XCircle className="w-6 h-6 text-alert-coral flex-shrink-0" />
          )}
          <div>
            <h4
              className={`text-sm font-bold uppercase tracking-wider font-display ${
                isValid ? 'text-brand-green' : 'text-alert-coral'
              }`}
            >
              {isValid ? 'Payload Validation Passed' : 'Payload Validation Failed'}
            </h4>
            <p className="text-xs text-brand-grey mt-0.5 font-medium">
              {isValid
                ? 'All prompt stages, JSON schema definitions, and example arrays conform to required syntax.'
                : `${errors.length} error(s) must be resolved before publishing.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastValidatedAt && (
            <span className="text-[10px] font-mono text-brand-grey tabular-nums">
              Checked {new Date(lastValidatedAt).toLocaleTimeString()}
            </span>
          )}
          <Button
            size="sm"
            variant="secondary"
            onClick={onRevalidate}
            disabled={isLoading}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Re-validate
          </Button>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="p-5 rounded-level4 border border-alert-coral/25 bg-alert-coral/5 space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-widest text-alert-coral flex items-center gap-1.5 font-display">
            <XCircle className="w-4 h-4" /> Errors ({errors.length})
          </h5>
          <ul className="space-y-1.5">
            {errors.map((err, idx) => (
              <li key={idx} className="text-xs text-brand-black dark:text-white flex items-start gap-2">
                <span className="font-mono text-alert-coral font-bold uppercase shrink-0">
                  [{err.field}]
                </span>
                <span>{err.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="p-5 rounded-level4 border border-amber-500/25 bg-amber-500/5 space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 flex items-center gap-1.5 font-display">
            <AlertTriangle className="w-4 h-4" /> Warnings ({warnings.length})
          </h5>
          <ul className="space-y-1.5">
            {warnings.map((warn, idx) => (
              <li key={idx} className="text-xs text-brand-black dark:text-white flex items-start gap-2">
                <span className="font-mono text-amber-700 dark:text-amber-400 font-bold uppercase shrink-0">
                  [WARNING]
                </span>
                <span>{warn}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
