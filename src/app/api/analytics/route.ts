import { BaseController } from '@core/backend/base-controller';
import { UsageRepo } from '@modules/analytics/infrastructure/usage.repository';

import { ensureBootstrapped } from '../bootstrap';

export async function GET() {
  try {
    await ensureBootstrapped();
    const stats = UsageRepo.getStats();
    const history = UsageRepo.getHistory();
    return BaseController.success({ stats, history });
  } catch (error) {
    return BaseController.handleError(error);
  }
}
