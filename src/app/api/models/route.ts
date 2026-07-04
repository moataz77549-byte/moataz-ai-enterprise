import { BaseController } from '@core/backend/base-controller';
import { getAllModels } from '@modules/providers/domain/model.registry';

export async function GET() {
  try {
    const models = getAllModels();
    return BaseController.success(models);
  } catch (error) {
    return BaseController.handleError(error);
  }
}
