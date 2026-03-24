/**
 * @brand-system/cost — Error Types
 *
 * @module cost/errors
 */

/**
 * Thrown when a model is not found in the cost rates configuration.
 */
export class UnknownModelError extends Error {
  public readonly code = 'UNKNOWN_MODEL';
  public readonly model: string;

  constructor(model: string) {
    super(`Unknown model "${model}" — not found in cost rates configuration.`);
    this.name = 'UnknownModelError';
    this.model = model;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when a client has exceeded their budget cap.
 */
export class BudgetExceededError extends Error {
  public readonly code = 'BUDGET_EXCEEDED';
  public readonly clientId: string;
  public readonly currentSpend: number;
  public readonly budgetCap: number;

  constructor(clientId: string, currentSpend: number, budgetCap: number) {
    super(
      `Budget exceeded for client "${clientId}": $${currentSpend.toFixed(2)} / $${budgetCap.toFixed(2)}.`
    );
    this.name = 'BudgetExceededError';
    this.clientId = clientId;
    this.currentSpend = currentSpend;
    this.budgetCap = budgetCap;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
