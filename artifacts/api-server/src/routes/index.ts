import { Router, type IRouter } from "express";
import healthRouter from "./health";
import reportsRouter from "./reports";
import alarmRouter from "./alarm";

const router: IRouter = Router();

router.use(healthRouter);
router.use(reportsRouter);
router.use(alarmRouter);

export default router;
