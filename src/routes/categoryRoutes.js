import express from 'express';
import { getCategoriesWithSubcategories } from '../controllers/categoryController.js';

const router = express.Router();

router.get('/with-subcategories', getCategoriesWithSubcategories);

export default router;
