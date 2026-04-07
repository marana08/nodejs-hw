import { celebrate, Segments } from 'celebrate';
import { Router } from 'express';
import {
  loginUserSchema,
  registerUserSchema,
} from '../validations/authValidation.js';
import { loginUser, logoutUser, refreshUserSession, registerUser } from '../controllers/authController.js';

const router = Router();

router.post(
  '/auth/register',
  celebrate({ [Segments.BODY]: registerUserSchema }),
  registerUser,
);

router.post(
  '/auth/login',
  celebrate({
    [Segments.BODY]: loginUserSchema,
  }),
  loginUser,
);

router.post('/auth/refresh', refreshUserSession);

router.post('/auth/logout', logoutUser);

export default router;
