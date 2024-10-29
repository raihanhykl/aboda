import express, {
  json,
  urlencoded,
  Express,
  Request,
  Response,
  NextFunction,
  Router,
} from 'express';
import cors from 'cors';
import { PORT } from './config';
import { AuthRouter } from './routers/auth.router';
import { CartRouter } from './routers/cart.router';
import { ErrorHandler, responseHandle } from './helpers/response';
import { ProductRouter } from './routers/product.router';
import { AddressRouter } from './routers/address.router';
import { UserRouter } from './routers/user.router';
import { join } from 'path';
import { OrderRouter } from './routers/order.router';
import { CategoryRouter } from './routers/category.admin.router';
import { BranchRouter } from './routers/branch.router';
import { StockRouter } from './routers/stock.router';
export default class App {
  private app: Express;

  constructor() {
    this.app = express();
    this.configure();
    this.routes();
    this.handleError();
  }

  private configure(): void {
    this.app.use(cors());
    this.app.use(json());
    this.app.use(urlencoded({ extended: true }));
    this.app.use(express.static(join(__dirname, '/public/images')));
  }

  private handleError(): void {
    // not found
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.path.includes('/api/')) {
        res.status(404).send('Not found !');
      } else {
        next();
      }
    });

    // error
    this.app.use(
      (err: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
        if (req.path.includes('/api/')) {
          res
            .status(err.statuscode || 500)
            .send(responseHandle(err.message, null, false));
        } else {
          next();
        }
      },
    );
  }

  private routes(): void {
    this.app.get('/api', (req: Request, res: Response) => {
      res.send(`Hello, Purwadhika Student API!`);
    });
    this.app.use('/api/auth', new AuthRouter().getRouter());
    this.app.use('/api/cart', new CartRouter().getRouter());
    this.app.use('/api/product', new ProductRouter().getRouter());
    this.app.use('/api/address', new AddressRouter().getRouter());
    this.app.use('/api/user', new UserRouter().getRouter());
    this.app.use('/api/order', new OrderRouter().getRouter());
    this.app.use('/api/stocks', new StockRouter().getRouter());
    this.app.use('/api/category', new CategoryRouter().getRouter());
    this.app.use('/api/branch', new BranchRouter().getRouter());
  }

  public start(): void {
    this.app.listen(PORT, () => {
      console.log(`  ➜  [API] Local:   http://localhost:${PORT}/`);
    });
  }
}
