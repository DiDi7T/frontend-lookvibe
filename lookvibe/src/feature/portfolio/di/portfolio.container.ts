import { sharedContainer } from '../../../shared/di/shared.container';
import { AddPortfolioPhotoUseCase } from '../application/use-cases/add-portfolio-photo.use-case';
import { GetPortfolioUseCase } from '../application/use-cases/get-portfolio.use-case';
import { HttpPortfolioRepository } from '../infraestructure/repositories/http-portfolio.repository';

const portfolioRepository = new HttpPortfolioRepository(sharedContainer.http);

export const portfolioContainer = {
  getPortfolio: new GetPortfolioUseCase(portfolioRepository),
  addPortfolioPhoto: new AddPortfolioPhotoUseCase(portfolioRepository),
};
